const { preset } = require( '@wordpress/scripts/config/jest-unit.config' );

module.exports = {
	preset,
	rootDir: '../../',
	transform: {
		'^.+\\.[jt]sx?$': '<rootDir>/node_modules/@wordpress/scripts/config/babel-transform',
	},
	setupFiles: [
		'<rootDir>/tests/js/setup-globals',
	],
	setupFilesAfterEnv: [
		'<rootDir>/tests/js/jest-matchers',
	],
	testMatch: [
		'<rootDir>/assets/**/__tests__/**/*.js',
		'<rootDir>/assets/**/test/*.js',
		'<rootDir>/assets/**/?(*.)test.js',
	],
	testPathIgnorePatterns: [
		'<rootDir>/.git',
		'<rootDir>/node_modules',
		'<rootDir>/build',
	],

	// Matches aliases in webpack.config.js.
	moduleNameMapper: {
		'^SubscribeWithGoogleCore/(.*)$': '<rootDir>assets/js/$1',
		'^GoogleComponents/(.*)$': '<rootDir>assets/js/components/$1',
		'^GoogleUtil/(.*)$': '<rootDir>assets/js/util/$1',
		'^GoogleModules/(.*)$': '<rootDir>assets/js/modules/$1',
	},
	collectCoverageFrom: [ 'assets/js/**/*.{js,jsx}' ],
	coveragePathIgnorePatterns: [ '/node_modules/', '<rootDir>/build/' ],
	coverageReporters: [ 'lcovonly' ],
	coverageDirectory: '<rootDir>/coverage/js',
};
