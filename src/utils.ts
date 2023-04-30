import fs from "fs";
import { Options } from "./types";
import { defaultConfig } from "./config";

export const createAndSaveFile = (fileName: string, content: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.writeFile(fileName, content, function (err) {
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

export const processSvgFileName = (nameArr: string[]) => {
  return nameArr
    .map((str: string) => {
      if (str.length > 1) {
        return str[0].toUpperCase() + str.slice(1);
      }
      return str[0].toUpperCase();
    })
    .join("");
};

// 递归创建目录
export function mkdirRecursive(dirname: string) {
  fs.mkdirSync(dirname, { recursive: true });
}


// 生成React组件
export const genSvgComponent = (name: string, svgStr: string) => {
  return `
        import React from 'react';
        import Icon from '@ant-design/icons';
        
        import { WoodIconProps } from '../../types';
        import ${name}Svg from "../../svgs/${name}";

        const ${name} = (props: WoodIconProps): JSX.Element => {
          return <Icon component={${name}Svg} {...props} />;
        }

        export default ${name};
    `;
};


export const normalizeConfig = (config:(defaultConfig: Options) => Options | Options) => {
  if (typeof config === "function") {
    return config(defaultConfig);
  }  

  return config;
}
