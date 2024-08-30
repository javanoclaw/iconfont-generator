import http = require("http");
import { Options } from "./types";
import { defaultConfig } from "./config";
import {
  createAndSaveFile,
  processSvgFileName,
  mkdirRecursive,
  genSvgComponent,
  normalizeConfig,
  removeDir,
  copyTypes,
} from "./utils";
import path = require("path");
import { CONFIG_FILE } from "./constants";
const prettier = require("prettier");

const svgReg = /<symbol[^>]*>(<path[^<]*><\/path>)+<\/symbol>/gi;

// load iconfont.js
const loadIconfontStr = async (url: string): Promise<string> => {
  return await new Promise((resolve, reject) => {
    http.get(url, (req) => {
      let js = "";
      req.on("data", (data: string) => {
        js += data;
      });
      req.on("end", () => {
        resolve(js);
      });
      req.on("error", (e: any) => {
        reject(e.message);
      });
    });
  });
};

// 将空格/- 去掉，转换成驼峰
const processSvgNameToArr = (name = ""): string[] => {
  return name
    .replace(/-/g, " ")
    .replace(/_/g, " ")
    .split(" ")
    .filter((str) => !!str)
    .map((item) => item.toLowerCase());
};

const createSVGFromSymbol = (prefix: string, str: string): Array<string[]> => {
  const symbolList = str.match(svgReg);
  if (symbolList) {
    const svgList: Array<string[]> = [];
    symbolList.forEach((sym: string) => {
      const idMatchResust = sym.match(/ id="(.*?)" /);
      if (idMatchResust && idMatchResust.length >= 2) {
        const svgNameArr = processSvgNameToArr(
          idMatchResust[1].replace("icon-", "")
        );
        svgList.push([
          processSvgFileName([prefix, ...svgNameArr]),
          sym
            .replace(
              /^<symbol/,
              `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" width="1em" height="1em" `
            )
            .replace(/<\/symbol>$/, "</svg>")
            // remove id
            .replace(/ id="(.*?)" /, ""),
        ]);
      }
    });
    return svgList;
  }
  return [];
};

const saveSvgList = async (
  dir: string,
  svgList: Array<string[]>,
  config: Options
) => {
  for (let data of svgList) {
    const svgName = data[0];
    const svgFileName = config.svgDir ? config.svgDir : `${dir}/svgs`;
    mkdirRecursive(svgFileName);

    await createAndSaveFile(
      path.join(svgFileName, `${svgName}.svg`),
      prettier.format(data[1], { parser: "babel-ts" })
    );
  }
};

const genSvgComponents = async (
  dir: string,
  svgList: Array<string[]>,
  config: Options
) => {
  const indexFileContent = [];
  for (let data of svgList) {
    const svgComponentName = data[0];

    // 不创建子组件
    const currentIconPath = path.join(`${dir}`, svgComponentName);
    mkdirRecursive(currentIconPath);
    await createAndSaveFile(
      path.join(currentIconPath, `/index.tsx`),
      prettier.format(
        genSvgComponent(data[0], config.svgAlias),
        { parser: "babel-ts" },
        config.svgAlias
      )
    );
    indexFileContent.push(
      `export { default as ${data[0]} } from "./${svgComponentName}";`
    );
  }
  // indexFileContent.push(
  //   `export { default as IconCreator } from "./components/icon-creator";`
  // );
  indexFileContent.push('export * from "./types";');
  // create index.ts
  const indexFilePath = path.join(dir, "index.ts");
  await createAndSaveFile(indexFilePath, indexFileContent.join("\n"));
};

const iconfontEXtract = async (options: Options) => {
  const config = Object.assign({}, defaultConfig, options);
  const outDir = path.join(process.cwd(), config.outDir || "icons");

  removeDir(outDir);
  mkdirRecursive(outDir);

  // load data
  const iconfontStr = await loadIconfontStr(config.url);
  const svgInfo = createSVGFromSymbol(config.prefix || "", iconfontStr);

  if (svgInfo.length) {
    await saveSvgList(outDir, svgInfo, config);
    await genSvgComponents(outDir, svgInfo, config);
    copyTypes(outDir);
  }
};

const run = () => {
  const configPath = path.join(process.cwd(), CONFIG_FILE);
  const configModule = require(configPath);
  const config = normalizeConfig(configModule.default || configModule);

  if (!config.url) {
    throw new Error("iconfontEXtract: url is required");
  }

  iconfontEXtract(config);
};

run();
