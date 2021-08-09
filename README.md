# Secretlint WebExtension

Check secrets in your request/response using secretlint.

![screenshot](img.png)

## Features

- Check that request/response includes credentials
- DevTools integration

## Motivation

Everyone makes mistakes.

A developer sometimes expose own credentials like OAuth token in a website accidentally.

[secretlint](https://github.com/secretlint/secretlint) can found credentials in file.
However, The exposed credentials come from environments variables or Database, so These are not embed in a file.

We want to found these exposed credentials.

Security research use proxy software like [Burp Suite](https://portswigger.net/burp), but web developer use DevTools instead of it.

Secretlint WebExtension integrate to DevTools in Chrome/Firefox.
Secretlint WebExtension help web developer to notice exposed credential.

## Install

- [ ] Firefox
- [ ] Chrome


## Changelog

See [Releases page](https://github.com/secretlint/webextension/releases).

## Running tests

Install devDependencies and Run `npm test`:

    npm test

## Contributing

Pull requests and stars are always welcome.

For bugs and feature requests, [please create an issue](https://github.com/secretlint/webextension/issues).

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## Author

- azu: [GitHub](https://github.com/azu), [Twitter](https://twitter.com/azu_re)

## License

MIT © azu
