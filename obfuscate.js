const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const srcDirectory = path.join(__dirname, 'src');
const publicDirectory = path.join(__dirname, 'public');
const CleanCSS = require('clean-css');
// Obfuscate JavaScript files
const obfuscateJSFiles = () => {
    const jsSourceDirectory = path.join(srcDirectory, 'js');
    const jsPublicDirectory = path.join(publicDirectory, 'js');

    // Ensure the destination directory exists
    if (!fs.existsSync(jsPublicDirectory)) {
        fs.mkdirSync(jsPublicDirectory, { recursive: true });
    }

    fs.readdirSync(jsSourceDirectory).forEach((file) => {
        const sourceFilePath = path.join(jsSourceDirectory, file);
        const code = fs.readFileSync(sourceFilePath, 'utf8');

        const obfuscatedCode = JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            numbersToExpressions: true,
            simplify: true,
            shuffleStringArray: true,
            splitStrings: true,
            splitStringsChunkLength: 10,
            stringArray: true,
            stringArrayThreshold: 0.75,
        }).getObfuscatedCode();

        const buildFilePath = path.join(jsPublicDirectory, file);
        fs.writeFileSync(buildFilePath, obfuscatedCode, 'utf8');
    });

    console.log('JavaScript files obfuscated and placed in the public/js directory.');
};

// Minify CSS files
const minifyCSSFiles = () => {
    const cssSourceDirectory = path.join(srcDirectory, 'css');
    const cssPublicDirectory = path.join(publicDirectory, 'css');

    // Ensure the destination directory exists
    if (!fs.existsSync(cssPublicDirectory)) {
        fs.mkdirSync(cssPublicDirectory, { recursive: true });
    }

    fs.readdirSync(cssSourceDirectory).forEach((file) => {
        const sourceFilePath = path.join(cssSourceDirectory, file);
        const css = fs.readFileSync(sourceFilePath, 'utf8');

        const minifiedCSS = new CleanCSS().minify(css).styles;

        const buildFilePath = path.join(cssPublicDirectory, file);
        fs.writeFileSync(buildFilePath, minifiedCSS, 'utf8');
    });

    console.log('CSS files minified and placed in the public/css directory.');
};

minifyCSSFiles();

obfuscateJSFiles();