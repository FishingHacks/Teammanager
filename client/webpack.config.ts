import * as path from 'path';
import * as webpack from 'webpack';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import { ESBuildMinifyPlugin } from 'esbuild-loader';

const config: webpack.Configuration = {
	output: {
		path: path.join(__dirname, '/build'), // the bundle output path
		filename: '[name].bundle.js', // the name of the bundle
		chunkFilename: '[name].bundle.js', // the name of the chunk
		publicPath: '/', // set the public path for the assets
	},
	entry: ['./src/index.tsx'],
	resolve: {
		extensions: ['.js', '.ts', '.jsx', '.tsx', '.css', '.png', '.svg', '.ttf'],
	},
	stats: {
		errorDetails: true,
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					{ loader: 'style-loader' },
					{ loader: 'css-loader' },
					{ loader: 'postcss-loader' },
				],
			},
			{
				test: /\.tsx?$/,
				loader: 'esbuild-loader',
				options: {
					loader: 'tsx',
					target: 'esnext',
				},
			},
			{
				test: /\.(png|ttf|svg)$/, // to import images and fonts
				loader: 'url-loader',
				options: { limit: false },
			},
		],
	},
	plugins: [
		new HTMLWebpackPlugin({
			template: 'public/index.html', // to import index.html file inside index.js
		}),
	],
	optimization: {
		splitChunks: {
			chunks: 'all',
		},
		minimizer: [
			new ESBuildMinifyPlugin({
				minify: true,
			}),
		],
	},
};

export default config;
