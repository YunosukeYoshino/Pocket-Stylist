const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add support for SVG files
config.transformer.babelTransformerPath = require.resolve(
	"react-native-svg-transformer",
);
config.resolver.assetExts = config.resolver.assetExts.filter(
	(ext) => ext !== "svg",
);
config.resolver.sourceExts = [...config.resolver.sourceExts, "svg"];

module.exports = config;
