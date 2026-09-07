package com.grandmastories.story.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
public class DocumentParserService {

    private static final int WORDS_PER_PAGE = 120;

    public ParsedDocument parse(MultipartFile file) {
        String filename = file.getOriginalFilename();
        if (filename == null || filename.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File name is required");
        }

        String lowerName = filename.toLowerCase();
        try (InputStream inputStream = file.getInputStream()) {
            if (lowerName.endsWith(".pdf")) {
                return parsePdf(inputStream, filename);
            }
            if (lowerName.endsWith(".docx")) {
                return parseDocx(inputStream, filename);
            }
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF and DOCX files are supported");
        } catch (IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unable to read uploaded document");
        }
    }

    private ParsedDocument parsePdf(InputStream inputStream, String filename) throws IOException {
        byte[] bytes = inputStream.readAllBytes();
        List<String> pages = new ArrayList<>();

        try (PDDocument document = Loader.loadPDF(bytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            int totalPages = document.getNumberOfPages();

            for (int page = 1; page <= totalPages; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String pageText = stripper.getText(document).trim();
                if (!pageText.isBlank()) {
                    pages.add(normalizeWhitespace(pageText));
                }
            }
        }

        if (pages.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No readable text found in PDF");
        }

        return new ParsedDocument(extractTitle(filename), String.join("\n\n", pages), pages);
    }

    private ParsedDocument parseDocx(InputStream inputStream, String filename) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream)) {
            StringBuilder fullText = new StringBuilder();
            for (XWPFParagraph paragraph : document.getParagraphs()) {
                String text = paragraph.getText().trim();
                if (!text.isBlank()) {
                    fullText.append(text).append("\n\n");
                }
            }

            String content = normalizeWhitespace(fullText.toString());
            if (content.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No readable text found in DOCX");
            }

            List<String> pages = splitIntoPages(content);
            return new ParsedDocument(extractTitle(filename), content, pages);
        }
    }

    List<String> splitIntoPages(String content) {
        String[] words = content.trim().split("\\s+");
        List<String> pages = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        int wordCount = 0;

        for (String word : words) {
            if (wordCount >= WORDS_PER_PAGE) {
                pages.add(current.toString().trim());
                current = new StringBuilder();
                wordCount = 0;
            }
            if (!current.isEmpty()) {
                current.append(' ');
            }
            current.append(word);
            wordCount++;
        }

        if (!current.isEmpty()) {
            pages.add(current.toString().trim());
        }

        return pages.isEmpty() ? List.of(content.trim()) : pages;
    }

    private String extractTitle(String filename) {
        String name = filename.replace("\\", "/");
        int slash = name.lastIndexOf('/');
        if (slash >= 0) {
            name = name.substring(slash + 1);
        }
        int dot = name.lastIndexOf('.');
        if (dot > 0) {
            name = name.substring(0, dot);
        }
        return name.replace('_', ' ').replace('-', ' ').trim();
    }

    private String normalizeWhitespace(String text) {
        return text.replaceAll("\\s+", " ").trim();
    }

    public record ParsedDocument(String title, String content, List<String> pages) {}
}
