# 文件上传解决方案

## 登录

- session
- jwt

## 返回数据规范

```js
{
  code: 0,
  data: {

  },
  message: ''
}
```

## 上传图片文件类型判断

- 使用 input 的 accept 属性去限制用户上传文件的格式。`<input type="file" accept=".png" />`
  - 但，这并不能真正的解决问题，accept 只是限制了用户选择的文件后缀名，这个特性依赖于浏览器的具体实现，而且用户还可以强制修改上传文件框中的文件类型。
  - 另外“聪明”的用户会直接修改文件后缀名。比如把 `logo.png` 修改为 `logo.jpg`
- 所以，我们需要更近一步的判断，一般来说我们都是从 `<input />` 元素的 files 属性中取得用户准备上传的文件 FileList ，其中的每一个 File 对象都有 type 属性，是这个文件的 mime 类型；但不幸的是，这个 mime 的值，目前浏览器的实现是文件扩展来假设的，当客户强制修改后缀名，或者没有拿到后缀名，这个 mime 也是不准确的

- 终极解决方案，既然从浏览器的对象中都无法获取到真实的文件类型，那我们再近一步，把文件的二进制内容读取出来，按照规范去比对。

### 查看文件的头信息

所有文件在计算机中都是以二进制形式进行存储的，但二进制是不方便做判断的，我们可以利用 vscode 插件以十六进制的形式查看二进制文件。

### 根据头信息判断文件类型

在获取文件对象，我们可以通过 FileReader API 来读取文件的内容，然后将结果转为 Unicode 编码，再转为 十六进制。

```js
async blobToString(blob) {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = function() {
      const res = reader.result
        .split("") // 将读取结果分割为数组
        .map(v => v.charCodeAt()) // 转为 Unicode 编码
        .map(v => v.toString(16).toUpperCase()) // 转为十六进制，再转大写
        .map(v => v.padStart(2, "0")) // 个位数补0
        .join(" "); // 转为字符串
      resolve(res)
    }
    reader.readAsBinaryString(blob) // 将文件读取为二进制字符串
  })
}
```
