# @dot-event/watchman

dot-event watchman operation

![watch](https://media1.tenor.com/images/4f1078aa4ee68342d0ef8df48646deaf/tenor.gif?itemid=8465130)

```bash
npm install -g @dot-event/watchman
```

Configure `package.json`:

```json
{
  "operations": {
    "watchman": {
      "triggers": [
        {
          "name": "babel",
          "expression": [
            "anyof",
            ["match", "lib/**/*.js", "wholename"]
          ],
          "command": ["npm", "run", "build"]
        }
      ]
    }
  }
}
```

Create watchman triggers:

```bash
dot-watchman
```

Remove watchman triggers:

```bash
dot-watchman --remove
```
