Hey there! 👋 Check out TheGitDown, a super handy tool for downloading files or creating download links from any **public directory or file on GitHub**. It's an easy way to grab what you need without the hassle.

Want to give it a try? Head over to [TheGitDown](https://gitdown.xyz) and see how simple it is!

### How Does It Work?

![See it in action](images/screenshot.png)

### Getting a Bit More Technical

With TheGitDown, you can customize your download. Let's say you want to download a specific directory from GitHub as a zip file, and even rename it or exclude the root directory. It's all possible! Just tweak the URL in this format: 

```https://gitdown.xyz/#/home?url=<GitHub link>&fileName=<your chosen name>&rootDirectory=<true/false or specific name>```. 

For example, to download a directory named `TheGitDown-Images.zip` without including the root directory, your URL would look like this: 

```https://gitdown.xyz/#/home?url=https://github.com/taylorsegell/TheGitDown/tree/master/images&rootDirectory=false```. 

This downloads a zip file named `images.zip`, minus the root folder.

### Security

A GitHub PAT was previously exposed in client source and has been removed from the working tree. Operators should rotate any leaked credentials; do not commit tokens. History scrubbing (`git filter-repo` / BFG) is out-of-band — see [SECURITY.md](SECURITY.md).

### License

Oh, and it's all under the [MIT License](https://opensource.org/licenses/MIT), so feel free to use and share it!

So, why not give it a go? It's a game-changer for GitHub downloads! 🚀💻