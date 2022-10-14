<?php 
/**
 * Plugin Name: 11ty Site Generator
 * Description: Uses my own node API to create a JAM site
 * 
 */

  function execute_request ($body, $method) {
    $curl = curl_init();
      curl_setopt_array($curl, array(
          CURLOPT_URL => 'http://172.26.32.1:8000' . $path,
          CURLOPT_RETURNTRANSFER => true,
          CURLOPT_ENCODING => '',
          CURLOPT_MAXREDIRS => 10,
          CURLOPT_TIMEOUT => 0,
          CURLOPT_FOLLOWLOCATION => true,
          CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
          CURLOPT_CUSTOMREQUEST => $method,
          CURLOPT_POSTFIELDS => $body,
          CURLOPT_HTTPHEADER => array(
            'Content-Type: application/json'
          ),
        ));

      $response = curl_exec($curl);
      curl_close($curl);  
  }


  function build_media_details (int $media_id) {
    $mediaDetails = wp_get_attachment_metadata($media_id);

    if(!is_null($mediaDetails) && !is_null($mediaDetails['sizes'])) {
      foreach ( $mediaDetails['sizes'] as $size => &$size_data ) {

        $image_src = wp_get_attachment_image_src( $media_id, $size );
        $src = wp_mime_type_icon( $media_id );
        
        if ( ! $image_src ) {
          continue;
        }
        $size_data['source_url'] = $image_src[0];
      }
  
      $full_src = wp_get_attachment_image_src( $media_id, 'full' );
  
      if ( ! empty( $full_src ) ) {
        $mediaDetails['sizes']['full'] = array(
          'file'       => wp_basename( $full_src[0] ),
          'width'      => $full_src[1],
          'height'     => $full_src[2],
          'source_url' => $full_src[0],
        );
      }
      $mediaDetails['source_url'] = wp_get_attachment_url( $media_id );
    }

    
    return $mediaDetails;
  }

  function buiild_categories($ids) {
    $categories = array();

    foreach ( $ids as $id) { 
      $category = get_category($id);
      array_push($categories, array(
        'id' => $category->term_id,
        'name' => $category->name,
        'slug' => $category->slug,
      ));
    }

    return $categories;

  }

  function fetch_posts($query) {
    $relatedPosts = get_posts($query);

    $result = array();
    foreach ( $relatedPosts as $post) { 
        $feature_media_id = get_post_thumbnail_id($post->ID);
        $media_details = build_media_details($feature_media_id);
        array_push($result, array(
            'id' => $post->ID,
            'slug' => $post->post_name,
            'title' => $post->post_title,
            'media_details' => $media_details
        ));
    } 

    return $result;
  }

  function fetch_related_posts($categories, $post_id) {
    $numberposts = 4;
    $category = implode(",", $categories);

    return fetch_posts(array(
      'numberposts' => $numberposts,
      'category' => $category,
      'exclude' => $post_id
        ));
  }

  function fetch_interested_posts($post_id) {
      $numberposts = 5;

      return fetch_posts(array(
          'numberposts' => $numberposts,
          'exclude' => $post_id
      ));
  }

  function get_post_information (WP_Post $post)  {
     
      $cats = $post->__get("post_category");
      $categories = buiild_categories($cats);
      $tags = wp_get_post_tags($post->ID);
      $featuredImageId = get_post_thumbnail_id($post->ID);
      $mediaDetails = build_media_details($featuredImageId);
      $excerpt = get_the_excerpt($post->ID);

      $body = '{ "id":'. $post->ID.', 
        "content": '.json_encode($post->post_content).', 
        "date": "'.$post->post_date.'", 
        "modified":"'.$post->post_modified.'", 
        "title":"'.$post->post_title.'", 
        "categories": '.json_encode($categories).', 
        "tags":'.json_encode($tags).', 
        "featuredMedia": '.json_encode($featuredImageId).', 
        "featureMediaInfo":'.json_encode($mediaDetails).', 
        "slug":"'.$post->post_name.'",
        "excerpt": '.json_encode($excerpt).',
        "relatedPosts":'.json_encode(fetch_related_posts($cats, $post->ID)).',
        "interestingPosts":'.json_encode(fetch_interested_posts($post->ID)).'
      }';
        return $body;
  }

  function delete_jam_post(int $post_ID) {
    $post = get_post($post_ID);
    $cats = $post->__get("post_category");
    $categories = buiild_categories($cats);

    $body = '{ "id":'. $post->ID.', 
      "categories": '.json_encode($categories).', 
      "slug":"'.str_replace('__trashed', '', $post->post_name).'"
    }';

    execute_request($body, 'DELETE', '/posts');
  }


  function update_jam_post($post_ID, $post_after, $post_before) {
     if($post_after->post_status == 'publish' || ($post_before->post_status == 'publish' && $post_after->post_status == 'publish')) {
      $body = get_post_information($post_after);
      execute_request($body, 'POST',  '/posts');
    } elseif ($post_before->post_status == 'publish' && $post_after->post_status == 'draft') {
      delete_jam_post($post_ID);
    } 
  }

  function publish_future_post($new_status, $old_status, $post) {
    if($new_status === 'publish' && $old_status === 'future') {
      $body = get_post_information($post);
      execute_request($body, 'POST',  '/posts');
    }
  }

  function preview_filter($preview_link, $post) {
    return 'http://localhost:8000/posts/'.$post->ID.'/preview';
  }

  //Run for new posts and for updates of the post
  add_action('post_updated', 'update_jam_post', 10, 3);
  add_action('trashed_post', 'delete_jam_post');
  add_action('transition_post_status', 'publish_future_post', 10, 3);

  add_filter('preview_post_link', 'preview_filter', 10, 3);

  
  //Extending POST API
  add_action('rest_api_init', function() {
    register_rest_field('post', 'tags_details', array(
      'get_callback' => function($post_arr) {
        return wp_get_post_tags($post_arr['id']);
      }
    )); 
  });

  add_action('rest_api_init', function(){
    register_rest_field('post', 'media_details', array(
      'get_callback' => function($post_arr) {
        $media_id = (int) get_post_thumbnail_id( $post->ID );
        return build_media_details($media_id);
      }
    ));
  });

  add_action('rest_api_init', function(){
    register_rest_field('post', 'related_posts', array(
      'get_callback' => function($post_arr) {
        return fetch_related_posts($post_arr['id'], $post_arr['categories']);
      }
    ));
  });

  add_action('rest_api_init', function(){
    register_rest_field('post', 'interested_posts', array(
      'get_callback' => function($post_arr) {
        return fetch_interested_posts($post_arr['id']);
      }
    ));
  });

  add_filter('rest_prepare_revision', function($response, $post){
    $data = $response->get_data();
    $data['interested_posts'] = fetch_interested_posts($post->parent);
    $data['related_posts'] = fetch_related_posts($data['parent'], $post->categories);
    $media_id = (int) get_post_thumbnail_id( $data['parent'] );
    $data['media_details'] = build_media_details($media_id);
    $data['tags_details'] = wp_get_post_tags($data['parent']);
    return rest_ensure_response( $data );
  }, 10, 2);
?>