package io.garusitell.dockerpromethus;

import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/posts")
@RequiredArgsConstructor
public class PostController {
  private final PostService postService;

  @PostMapping
  public Post createPost(@RequestBody PostDto postDto){
    return postService.save(postDto);
  }

  @GetMapping("/{id}")
  public Post getPost(@PathVariable Long id){
    return postService.getPostById(id);
  }

  @GetMapping
  public List<Post> getAllPosts(){
    return postService.getAllPosts();
  }

  @PatchMapping("/{id}")
  public Post updatePostPartial(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
    return postService.updatePost(id, updates);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT) // 삭제 성공 시 204 No Content 응답
  public void deletePost(@PathVariable Long id) {
    postService.deletePost(id);
  }


}
