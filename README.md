![](https://upload.wikimedia.org/wikipedia/commons/d/d7/TabberNeue-icon-ltr.svg)
# TabberTransclude
![](https://github.com/ciencia/mediawiki-extensions-TabberTransclude/actions/workflows/mediawiki.yml/badge.svg)

TabberTransclude is a fork of the TabberNeue extension, which adds a new parser tag to work with transcluded pages.

* [Extension:TabberNeue on MediaWiki](https://www.mediawiki.org/wiki/Extension:TabberNeue).
* [Extension:Tabber on MediaWiki](https://www.mediawiki.org/wiki/Extension:Tabber)

## Requirements
* [MediaWiki](https://www.mediawiki.org) 1.35 or later

## Installation
You can get the extension via Git (specifying TabberTransclude as the destination directory):

    git clone https://github.com/ciencia/mediawiki-extensions-TabberTransclude.git TabberTransclude

Or [download it as zip archive](https://github.com/ciencia/mediawiki-extensions-TabberTransclude/archive/main.zip).

In either case, the "TabberTransclude" extension should end up in the "extensions" directory 
of your MediaWiki installation. If you got the zip archive, you will need to put it 
into a directory called TabberTransclude.

## Usage (classic)
TabberTransclude uses the exact same syntax as Tabber and TabberNeue.
Tabs are created with `tabName=tabBody`, and separated by `|-|`.
```html
<tabber>
 tab1=Some neat text here
|-|
 tab2=
 [http://www.google.com Google]<br/>
 [http://www.cnn.com Cnn]<br/>
|-|
 tab3={{Template:SomeTemplate}}
</tabber>
```

### Parser functions and conditionals
```html
<tabber>
Tab1 = {{{1|}}}
|-|
Tab2 = {{{2|}}}
</tabber>
```
Becomes:
```
{{#tag:tabber|
Tab1={{{1|}}}
{{!}}-{{!}}
Tab2={{{2|}}}
}}
```

## Transclusion

With the transclusion mode, the syntax is different, and it's more similar to `<gallery>` syntax.

The contents of the page of the first tab will be transcluded. Other tabs will be transcluded on-demand with AJAX, performing a request to the MediaWiki api. Once requested, they won't be fetched again until the page is reloaded.

Tabs are created with `pageName|tabName`, and separated by a new line.
```html
<tabbertransclude>
My page 1|First tab
A second page|Second tab
Another tab
</tabbertransclude>
```

## Configurations
Name | Description | Values | Default
:--- | :--- | :--- | :---
`$wgTabberNeueEnableMD5Hash` | Enable or disable appending unique MD5 hash key to tabs. Disable if you need permalink to specific tabs. | `true`; `false` | `true`
