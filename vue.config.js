module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
  ? '/task-manager/'
  : '/',
  devServer: {
    host: "0.0.0.0",
    port: "3000",
    disableHostCheck: true
  },
  lintOnSave: false
}
