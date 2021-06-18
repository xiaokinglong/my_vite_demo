const fs = require("fs");
const path = require("path");
const compilerSfc = require("@vue/compiler-sfc");
const compilerDom = require("@vue/compiler-dom");

const koa = require("koa");

// import fs from 'fs';
// import path from 'path';
// import {compilerDom} from '@vue/compiler-sfc';
// import compilerDom from '@vue/compiler-dom';
// import koa from 'koa';
const app = new koa();

app.use(async (ctx) => {
  const { url, query } = ctx;
  if (url === "/") {
    // tips 读取html文件
    const content = fs.readFileSync("./index.html", "utf-8");
    ctx.body = content;
  } else if (url.endsWith(".js")) {
    // tips 读取的js文件
    const p = path.join(__dirname, url);
    ctx.type = "text/javascript";
    const file = rewriteImport(fs.readFileSync(p, "utf-8"));
    ctx.body = file;
  } else if (url.startsWith("/@modules/")) {
    // tips 将/@modules/ 读取的对应的js
    const moduleName = url.replace("/@modules/", "");
    // 前缀
    const prefix = path.join(__dirname, "./node_modules", moduleName);
    // tips 读取对应的模块
    const module = require(prefix + "/package.json").module;

    const filePath = path.join(prefix, module);

    // 读取对应的文件
    const result = fs.readFileSync(filePath, "utf-8");

    ctx.type = "text/javascript";
    // tips 读取的文件里面的可能还回使用的import的导入的继续改变的对应的路径
    ctx.body = rewriteImport(result);
    // tips 这是的会出现的一个 process的问题
  } else if (url.indexOf(".vue") > -1) {
    // tips 使用sfc解析.vue文件
    // tips 读取.vue文件
    const p = path.join(__dirname, url.split("?")[0]);
    // 获取对应的ast
    const ast = compilerSfc.parse(fs.readFileSync(p, "utf-8"));
    // tips 跟就query来判断是sfc 还是tempalte
    if (!query.type) {
      // sfc
      //
      const scriptContent = ast.descriptor.script.content;
      console.log({ p, url, ast, scriptContent });
      // tips 替换 export default
      const script = scriptContent.replace("export default ", "const __script = ");
      console.log({ script });
      ctx.type = "text/javascript";
      ctx.body = `
      ${rewriteImport(script)}
      // template解析转换为另一个请求单独做
      import {render as __render} from '${url}?type=template'
      __script.render = __render
      export default __script
    `;
    } else if (query.type == 'template') {
      // tips
      console.log('解析template')
      const tpl = ast.descriptor.template.content;
      // 编译为包含render模块
      const render = compilerDom.compile(tpl, { mode: "module" }).code;
      ctx.type = "text/javascript";
      ctx.body = rewriteImport(render);
    }

    // ctx.body = '.vue'
  }
});

app.listen(3000, () => {
  console.log("🌈");
  console.log("http://127.0.0.1:3000/");
});

// 重写导入，变成相对地址
function rewriteImport(content) {
  return content.replace(/ from ['"](.*)['"]/g, function(s0, s1) {
    // s0匹配字符串，s1分组内容
    // 看看是不是相对地址
    if (s1.startsWith("./") || s1.startsWith("/") || s1.startsWith("../")) {
      // 原封不动的返回
      return s0;
    } else {
      // 裸模块
      return ` from '/@modules/${s1}'`;
    }
  });
}
