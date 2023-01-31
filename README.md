## esbuild JavaScript API 原理探究

使用 Go/Rust 实现的前端打包工具层出不穷。这些工具虽然其他语言开发的，但是可以在 JavaScript 中无缝使用。它们是基于什么原理做到跨语言调用的呢？本文以 esbuild JavaScript API 为研究对象，探讨其背后的原理。

#### 测试

```bash
# 构建
yarn && yarn run build

# 执行测试
node dist/main.js
```

构建结果：

```
=== transformed ts file ===

var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
__export(exports, {
  default: () => test,
  run: () => run
});
const id = 123;
function test() {
  console.log("test function");
}
function run() {
  console.log("run");
  console.log(`id is ${id}`);
}

=== transformed json file === 

module.exports = {
  name: "dig-esbuild-interop",
  version: "0.0.0",
  scripts: {
    build: "tsc",
    test: "node dist/main.js",
    prettier: "prettier --write '**/*.{js,jsx,tsx,ts,less,md,json}'"
  },
  devDependencies: {
    "@types/node": "^17.0.10",
    prettier: "^2.5.1",
    typescript: "^4.3.2",
    vite: "^2.4.4"
  }
};
```

#### 通信协议

查看协议格式。

```bash
# 请求包体
hexdump -C fixture/request

# 响应包体
hexdump -C fixture/response
```

#### 个人理解
+ 简单看文章
    + 问题：esbuild是Go语言实现的，但是再JavaScript环境中，我们却可以把它当做一个普通的npm包调用？他是如何实现跨语言调用的？
    + 进程间通信
        + 查看当前node项目的pid：ps aux
        + 查看进程间的关系：pstree pid
+ 开始研究
    + 把实例代码拉取并运行
        + tsc讲js代码编译成js代码
        + hexdump -C fixture/request是个linux命令
    + 通过ps命令清楚的查看进程之间的关系
        + yarn run dev进程（父进程）
        + vite进程（子进程）
        + esbuild进程（子进程）
    + 语法翻译
        + 将shell代码变成Node代码
        + 缺点：一次只能编译一个文件、编译多个文件的话，会频繁创建进程
        + 改进：加上--ping参数可以让esbuild进程保持运行不退出，从而不断地接受来自stdin的请求
    + 通信协议
        + 模型构建
        + 传输协议（node进程和esbuild进程怎么通信、传输的话使用stdin，stdout）
+ 我的理解
+ esbuild的安装包是一个二进制文件，在任何系统中都可以运行
+ node创建子进程和esbuild通信
+ node把代码交给esbuild去编译，esbuild把编译后的代码传回给node