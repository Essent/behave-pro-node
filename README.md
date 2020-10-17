# Behave Pro NodeJS Client

```
$ npm install @essent/behavepro -g
```

See [API Key setup](introduction.html) to retrieve the required credentials.

## Using from the command line

Parameters can either be passed from the command line:

```
$ behavepro [--id PROJECT ID] [--userId USER] [--apiKey KEY]
```

Available parameters:

* [**--host HOST**] *Behave Pro host - default: 'http://behave.pro'*
* [**--id PROJECT ID**] *JIRA project id*
* [**--userId USER**] *Behave Pro user id*
* [**--apiKey KEY**] *Behave Pro api key*
* [**--output DIRECTORY**] *Output directory - default: 'features'*
* [**--manual**] *Include scenarios marked as manual*
* [**--config CONFIG**] *JSON config file - relative to current directory*

If the three required parameters are missing, they will be attempted to be read from a json config file in the current directory:

```
$ behavepro
```

config.json
```
[{
    "id": 10000,
    "userId": "amlyYToyNDM0ZG.....ZiNzQwNGI=",
    "apiKey": "44993b0481838e.....a246c723e8e"
}, {
    "id": 10100,
    "userId": "amlyYToyNDM0ZG.....ZiNzQwNGI=",
    "apiKey": "b038a67e0f15e5.....fae00662c8a"
}]
```

Any additional parameters are to be specified from the command line.

The host can vary between products, see table below.

<table>
  <tr>
    <th>Product</th>
    <th>Host</th>
  </tr>

  <tr>
    <td>Behave Pro Cloud (default)</td>
    <td>https://behave.pro</td>
  </tr>

  <tr>
    <td>Behave Pro Server</td>
    <td>Address of the VM</td>
  </tr>

  <tr>
    <td>Behave for JIRA</td>
    <td>JIRA address</td>
  </tr>
</table>


## Using from within a script

You can use the client in your own scripts to download features from Behave Pro.

```
$ npm install behavepro --save
```


```
var BehavePro = require('behavepro');

BehavePro({
  "id": 10000,
  "userId": "amlyYToyNDM0ZG.....ZiNzQwNGI=",
  "apiKey": "44993b0481838e.....a246c723e8e"
}).then(() => {
  // done
})
```

Available parameters:

* **"host": HOST** - *Behave Pro host - default: 'http://behave.pro'*
* **"id": ID** - *JIRA project id*
* **"userId": USERID** - *Behave Pro user id*
* **"apiKey": APIKEY** - *Behave Pro api key*
* **"output": DIRECTORY** - *Output directory - default: 'features'*
* **"manual": true** - *Include scenarios marked as manual*
