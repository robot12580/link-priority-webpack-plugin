const HtmlWebpackPlugin = require('html-webpack-plugin');
class LinkPriorityWebpackPlugin {
  constructor(options) {
    console.log(options)
    this.options = options;
    this.resourceHints = [];
  }

  apply(compiler) {
    compiler.hooks.compilation.tap(
      this.constructor.name,
      compilation => {
        // 获取 link 标签数组
        HtmlWebpackPlugin.getHooks(compilation).beforeAssetTagGeneration.tapAsync(
          this.constructor.name,
          (htmlPluginData, callback) => {
            this.generateLinks(compilation, htmlPluginData);
            callback();
          }
        );
        // 根据获取到的 link 标签数组生成标签
        HtmlWebpackPlugin.getHooks(compilation).alterAssetTags.tapAsync(
          this.constructor.name,
          (htmlPluginData, callback) => {
            htmlPluginData.assetTags.styles = [
              ...htmlPluginData.assetTags.styles,
              ...this.resourceHints
            ];
            callback();
          }
        )
      }
    )
  }

  generateLinks(compilation, htmlPluginData) {
    let { rel, include } = this.options;
    //获取本次编译产出的代码块
    let chunks = [...compilation.chunks]; // chunks: Set
    //过滤掉非动态引入（懒加载）的模块
    chunks = chunks.filter(chunk => !chunk.canBeInitial());

    // 获取所有异步模块中所有的文件
    const allFiles = chunks.reduce((accumulated, chunk) => {
      return accumulated.concat([...chunk.files])
    }, []);

    // 去除重复的模块
    const uniqueFiles = new Set(allFiles);

    // 获取 link 标签数组
    const links = [];
    for (const file of uniqueFiles) {
      const href = file;
      const attributes = { href, rel, as: "script" };
      links.push({
        tagName: 'link',
        attributes
      });
    }
    this.resourceHints = links;
  }
}

module.exports = LinkPriorityWebpackPlugin;