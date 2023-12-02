<h1> <img src="https://github.com/MinhasKamal/TheGitDown/raw/master/res/images/TheGitDown.png" width="20" height=auto /> TheGitDown </h1>

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?business=5KR6BA9MYTM62&no_recurring=0&currency_code=USD)

#### Create GitHub Resource Download Link

With this tool you can directly download or create download link to any GitHub **public directory or file**.

### Website

[TheGitDown ↑](https://minhaskamal.github.io/TheGitDown)

### How to Use?

<table><tr><td> <img src="https://cloud.githubusercontent.com/assets/5456665/17822364/940bded8-6678-11e6-9603-b84d75bccec1.gif" /> </td></tr></table>

##### Advanced Usage

A typical download URL will look like this- `https://minhaskamal.github.io/TheGitDown/#/home?url=<link>&fileName=<name>&rootDirectory=<true or false or name>`

Now, if you want to download this directory- **`https://github.com/MinhasKamal/TheGitDown/tree/master/res/images`** with this file name- **`TheGitDown-Images.zip`** and this root directory name- **`ImagesOfTheGitDown`**, then the URL will be- https://minhaskamal.github.io/TheGitDown/#/home?url=https://github.com/MinhasKamal/TheGitDown/tree/master/res/images&fileName=TheGitDown-Images&rootDirectory=ImagesOfTheGitDown

In default, value of `fileName` and `rootDirectory` is set to the name of the downloading file or directory. If you do not want to add the directory itself in the zip, then set `rootDirectory=false`. Like: this link- https://minhaskamal.github.io/TheGitDown/#/home?url=https://github.com/MinhasKamal/TheGitDown/tree/master/res/images&rootDirectory=false, will download a file named **`images.zip`**; however the root directory- `"images"`, will not be included in the zip.

If you want to download file- **`https://github.com/MinhasKamal/TheGitDown/blob/master/res/images/TheGitDown.png`** with name- **`TheGitDownIcon.zip`**, then the link will be- https://minhaskamal.github.io/TheGitDown/#/home?url=https://github.com/MinhasKamal/TheGitDown/blob/master/res/images/TheGitDown.png&fileName=TheGitDownIcon

### License
<a rel="license" href="https://opensource.org/licenses/MIT"><img alt="MIT License" src="https://cloud.githubusercontent.com/assets/5456665/18950087/fbe0681a-865f-11e6-9552-e59d038d5913.png" width="60em" height=auto/></a><br/><a href="https://github.com/MinhasKamal/TheGitDown">TheGitDown</a> is licensed under <a rel="license" href="https://opensource.org/licenses/MIT">MIT License</a>.
