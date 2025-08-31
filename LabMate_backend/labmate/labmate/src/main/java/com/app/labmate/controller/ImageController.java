package com.app.labmate.controller;

import com.app.labmate.model.Collaboration;
import com.app.labmate.model.ImageEntity;
import com.app.labmate.repo.ImageRepository;
import com.app.labmate.service.CollaborationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/api")
public class ImageController {
    @Autowired
    private ImageRepository imageRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException, IOException {
        ImageEntity image = new ImageEntity();
        image.setName(file.getOriginalFilename());
        image.setImageData(file.getBytes());
        imageRepository.save(image);
        return ResponseEntity.ok("Image uploaded successfully");
    }

//    @GetMapping("/{id}")
//    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
//        Optional<ImageEntity> imageEntity = imageRepository.findById(id);
//        return imageEntity.map(img -> ResponseEntity
//                        .ok()
//                        .contentType(MediaType.IMAGE_JPEG)
//                        .body(img.getImageData()))
//                .orElseGet(() -> ResponseEntity.notFound().build());
//    }

    @GetMapping("/latest")
    public ResponseEntity<byte[]> getLatestImage() {
        List<ImageEntity> all = imageRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        if (!all.isEmpty()) {
            ImageEntity latest = all.get(0);
            return ResponseEntity.ok().contentType(MediaType.IMAGE_JPEG).body(latest.getImageData());
        }
        return ResponseEntity.notFound().build();
    }
}
