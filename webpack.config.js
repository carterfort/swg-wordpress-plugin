/**
 * Webpack config.
 *
 * Subscribe with Google, Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const path = require( 'path' );
const TerserPlugin = require( 'terser-webpack-plugin' );
const WebpackBar = require( 'webpackbar' );

/**
 * WordPress dependencies
 */
const LibraryExportDefaultPlugin = require( '@wordpress/library-export-default-webpack-plugin' );

/**
 * Given a string, returns a new string with dash separators converted to
 * camel-case equivalent. This is not as aggressive as `_.camelCase` in
 * converting to uppercase, where Lodash will convert letters following
 * numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
function camelCaseDash( string ) {
	return string.replace(
		/-([a-z])/g,
		( match, letter ) => letter.toUpperCase()
	);
}

const externalPackages = [
	'api-fetch',
	'compose',
	'dom-ready',
	'element',
	'escape-html',
	'hooks',
	'i18n',
	'is-shallow-equal',
	'url',
];

const externals = {
	react: 'React',
	'react-dom': 'ReactDOM',
	tinymce: 'tinymce',
	moment: 'moment',
	jquery: 'jQuery',
	lodash: 'lodash',
	'lodash-es': 'lodash',
};

[
	...externalPackages,
].forEach( ( name ) => {
	externals[ `@wordpress/${ name }` ] = [ 'wp', camelCaseDash( name ) ];
} );

const externalEntry = {};
externalPackages.forEach( ( packageName ) => {
	const name = camelCaseDash( packageName );
	externalEntry[ name ] = `./node_modules/@wordpress/${ packageName }`;
} );

// This External Libraries will not part of wp object. Most of this is for Polyfill.
const externalLibrary = {
	'wp-polyfill': './node_modules/@babel/polyfill/dist/polyfill.js',
	'wp-polyfill-fetch': './node_modules/whatwg-fetch/dist/fetch.umd.js',
	'wp-polyfill-element-closest': './node_modules/element-closest/element-closest.js',
	'wp-polyfill-node-contains': './node_modules/polyfill-library/polyfills/Node/prototype/contains/polyfill.js',
	'wp-polyfill-formdata': './node_modules/formdata-polyfill/FormData.js',
	'wp-polyfill-url': './node_modules/url-polyfill/url-polyfill.js',
	svgxuse: './node_modules/svgxuse/svgxuse.js',
};

const resolve = {
	alias: {
		SubscribeWithGoogleCore: path.resolve( 'assets/js/' ),
		GoogleComponents: path.resolve( 'assets/js/components/' ),
		GoogleUtil: path.resolve( 'assets/js/util/' ),
		GoogleModules: path.resolve( './assets/js/modules/' ),
	},
};

module.exports = ( env, argv ) => {
	return [

		// Build the settings js..
		{
			entry: {
				'swg-hello': './assets/js/hello.js',
			},
			output: {
				filename: '[name].js',
				path: __dirname + '/dist/assets/js',
				chunkFilename: '[name].js',
				publicPath: '',
			},
			performance: {
				maxEntrypointSize: 175000,
			},
			module: {
				rules: [
					{
						test: /\.js$/,

						use: [
							{
								loader: 'babel-loader',
								query: {
									presets: [ [ '@babel/env', {
										useBuiltIns: 'entry',
										corejs: 2,
									} ], '@babel/preset-react' ],
								},
							},
							{
								loader: 'eslint-loader',
								options: {
									formatter: require( 'eslint' ).CLIEngine.getFormatter( 'stylish' ),
								},
							},
						],
					},
				],
			},
			plugins: ( env && env.analyze ) ? [] : [
				new WebpackBar( {
					name: 'Module Entry Points',
					color: '#fbbc05',
				} ),
			],
			optimization: {
				minimizer: [
					new TerserPlugin( {
						parallel: true,
						sourceMap: false,
						cache: true,
						terserOptions: {
							keep_fnames: /__|_x|_n|_nx|sprintf/,
							output: {
								comments: /translators:/i,
							},
						},
						extractComments: false,
					} ),
				],
				splitChunks: {
					cacheGroups: {
						default: false,
						vendors: false,

						// vendor chunk
						vendor: {
							name: 'vendor',
							chunks: 'all',
							test: /node_modules/,
							priority: 20,
						},

						// commons chunk
						commons: {
							name: 'commons',
							minChunks: 2,
							chunks: 'initial',
							priority: 10,
							reuseExistingChunk: true,
							enforce: true,
						},
					},
				},
			},
			externals,
			resolve,
		},

		// Build the test files.
		{
			entry: { 'swg-tests': './assets/js/swg-tests.js' },
			output: {
				filename: '[name].js',
				path: __dirname + '/dist/assets/js',
				chunkFilename: '[name].js',
				publicPath: '',
			},
			module: {
				rules: [
					{
						test: /\.js$/,

						use: [
							{
								loader: 'babel-loader',
								query: {
									presets: [ [ '@babel/env', {
										useBuiltIns: 'entry',
										corejs: 2,
									} ], '@babel/preset-react' ],
								},
							},
							{
								loader: 'eslint-loader',
								options: {
									formatter: require( 'eslint' ).CLIEngine.getFormatter( 'stylish' ),
								},
							},
						],
					},
				],
			},
			plugins: ( env && env.analyze ) ? [] : [
				new WebpackBar( {
					name: 'Test files',
					color: '#34a853',
				} ),
			],
			resolve,
		},

		// Build the external wp libraries
		{
			entry: externalEntry,
			output: {
				filename: '[name].js',
				path: __dirname + '/dist/assets/js/externals',
				library: [ 'wp', '[name]' ],
				libraryTarget: 'this',
			},
			plugins: ( env && env.analyze ) ? [
				new LibraryExportDefaultPlugin( [
					'api-fetch',
					'dom-ready',
				].map( camelCaseDash ) ),
			] : [
				new LibraryExportDefaultPlugin( [
					'api-fetch',
					'dom-ready',
				].map( camelCaseDash ) ),
				new WebpackBar( {
					name: 'External WP Libraries',
					color: '#d53e36',
				} ),
			],
			externals,
		},

		// Build the external libraries
		{
			entry: externalLibrary,
			output: {
				filename: '[name].js',
				path: __dirname + '/dist/assets/js/externals',
			},
			plugins: ( env && env.analyze ) ? [] : [
				new WebpackBar( {
					name: 'External Libraries',
					color: '#4185f4',
				} ) ],
			externals,
		},

		// Build the main plugin admin css.
		{
			entry: {
				hello: './assets/sass/hello.scss',
			},
			module: {
				rules: [
					{
						test: /\.scss$/,
						use: [
							MiniCssExtractPlugin.loader,
							{
								loader: 'css-loader',
								options: {
									minimize: ( 'undefined' === typeof argv || 'production' === argv.mode ),
								},
							},
							'postcss-loader',
							{
								loader: 'sass-loader',
								options: { },
							},
						],
					},
					{
						test: /\.(png|woff|woff2|eot|ttf|svg|gif)$/,
						use: { loader: 'url-loader?limit=100000' },
					},
				],
			},
			plugins: ( env && env.analyze ) ? [
				new MiniCssExtractPlugin( {
					filename: '/assets/css/[name].css',
				} ),
			] : [
				new MiniCssExtractPlugin( {
					filename: '/assets/css/[name].css',
				} ),
				new WebpackBar( {
					name: 'Plugin CSS',
					color: '#4285f4',
				} ),
			],
		},
	];
};
