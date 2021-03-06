<?php
namespace SubscribeWithGoogle\WordPress\Tests;

use SubscribeWithGoogle\WordPress\Header;
use SubscribeWithGoogle\WordPress\Plugin;
use WP_UnitTestCase;

class HeaderTest extends WP_UnitTestCase {

	private $post_id = null;

	public function setUp() {
		parent::setUp();

		if ( $this->post_id == null ) {
			// Set publication ID site-wide.
			update_option( 'SubscribeWithGoogle_publication_id', 'example.com' );

			// Create a post.
			$this->post_id = $this->factory->post->create();
			wp_update_post( array(
				'ID' => $this->post_id,
				'post_content' => 'Hello world',
				'post_name' => 'paid-post',
				'post_title' => 'Paid post',
			) );

			// Visit the post.
			$this->go_to("/?p={$this->post_id}");
		}

		// Reset AMP var.
		global $is_amp;
		$is_amp = false;
	}

	public function test__handle_wp_head__adds_scripts_and_styles() {
		Header::modify();
		$this->expectOutputRegex( '/"@type": "NewsArticle",/' );

		$scripts = wp_scripts();
		$this->assertContains( 'swg-js', $scripts->queue );
		$this->assertContains( 'subscribe-with-google', $scripts->queue );

		$styles = wp_styles();
		$this->assertContains( 'subscribe-with-google', $styles->queue );
	}

	public function test__handle_wp_head__is_amp__adds_amp_extension() {
		global $is_amp;
		$is_amp = true;

		Header::modify();

		$this->expectOutputRegex(
			'/custom-element="amp-subscriptions-google"/'
		);

		Header::modify();
	}

	public function test__adds_product_id_meta_tag__basic() {
		update_post_meta(
			$this->post_id,
			'SubscribeWithGoogle_product',
			'basic'
		);

		$this->expectOutputRegex(
			'/"productID": "example.com:basic"/'
		);

		Header::modify();
	}

	public function test__adds_product_id_meta_tag__premium() {
		update_post_meta(
			$this->post_id,
			'SubscribeWithGoogle_product',
			'premium'
		);

		$this->expectOutputRegex(
			'/"productID": "example.com:premium"/'
		);

		Header::modify();
	}

	public function test__adds_free_meta_tag__true() {
		update_post_meta(
			$this->post_id,
			'SubscribeWithGoogle_free',
			'true'
		);

		$this->expectOutputRegex(
			'/"isAccessibleForFree": true,/'
		);

		Header::modify();
	}

	public function test__adds_free_meta_tag__false() {
		update_post_meta(
			$this->post_id,
			'SubscribeWithGoogle_free',
			'false'
		);

		$this->expectOutputRegex(
			'/"isAccessibleForFree": false,/'
		);

		Header::modify();
	}

	public function test__adds_free_meta_tag__defaults_to_false() {
		update_post_meta(
			$this->post_id,
			'SubscribeWithGoogle_free',
			null
		);

		$this->expectOutputRegex(
			'/"isAccessibleForFree": false,/'
		);

		Header::modify();
	}
}
