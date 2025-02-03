import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
 
import HtmlWebpackPlugin from "html-webpack-plugin";

import { merge } from "webpack-merge";

import CopyPlugin from "copy-webpack-plugin";

module.exports = (env: { mode: "development" | "production" }) => {
    const config = {
        entry: "./src/index.ts",

        resolve: {
            extensions: [".ts", ".tsx", ".js", ".json"],
        },

        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                        },
                        "css-loader",
                    ],
                },
            ],
        },
        optimization: {
            splitChunks: {
                chunks: "all",
            },
        },

        plugins: [
            new HtmlWebpackPlugin({
                title: "Minesweeper",
                favicon: "assets/favicon.ico",
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: "assets/**",
                        to({ context, absoluteFilename }: { context: string; absoluteFilename?: string }) {
                            if (absoluteFilename === undefined) {
                                throw new Error("absoluteFilename is undefined.");
                            }

                            const assetsPath = path.resolve(__dirname, "assets");
                            const endPath = absoluteFilename.slice(assetsPath.length);

                            return Promise.resolve(path.join("assets", endPath));
                        },
                    },
                ],
            }),
        ],
    };
    const isDev = env.mode === "development";
    const webpackConfigFile = isDev ? "webpack.dev.ts" : "webpack.prod.ts";
    const envConfig = require(path.resolve(__dirname, webpackConfigFile))();

    const mergedConfig = merge(config, envConfig);

    return mergedConfig;
};
