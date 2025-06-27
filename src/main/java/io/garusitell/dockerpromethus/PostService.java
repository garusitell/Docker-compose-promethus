package io.garusitell.dockerpromethus;


import java.util.List;
import java.util.Map;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PostService {
  private final PostRepository postRepository;

  @Transactional
  public Post save(PostDto postDto){
    Post post = new Post(postDto.getTitle(), postDto.getContent());
    return postRepository.save(post);
  }

  @Transactional(readOnly = true)
  public Post getPostById(Long id){
    return postRepository.findById(id).orElseThrow(()-> new IllegalArgumentException("Post not found"));
  }

  @Transactional(readOnly = true)
  public List<Post> getAllPosts(){
    return postRepository.findAll();
  }

  public Post updatePost(Long id , Map<String, Object> updates){
    Post post = getPostById(id);
    if(updates.containsKey("title")){
      post.setTitle(updates.get("title").toString());
    }
    if(updates.containsKey("content")){
      post.setContent(updates.get("content").toString());
    }
    return post;
  }
  public void deletePost(Long id){
    postRepository.deleteById(id);
  }
}
