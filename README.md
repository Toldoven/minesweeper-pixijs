# Minesweeper PixiJS

A copy of WindowsXP version of the Minesweeper game built with PixiJS.

![](https://i.imgur.com/rtkruuS.png)


## How to run

1. Install the dependencies


```
npm i 
```

2. Start the development server at `localhost:8080`

```
npm run start
```

## How to change difficulty

There is no UI for changing difficulty for now, but you can change it with URL Parameters.

Difficulty can be either `beginner`, `intermediate`, `expert` or `custom`.

Example:

```
http://localhost:8080/?difficulty=expert
```

If the custom difficulty is selected - you can set custom width, height and bomb count using URL Parameters.

Example: 

```
http://localhost:8080/?difficulty=custom&width=20&height=10&bombs=20
```


## TODO:

- Left number display should display the number of remaining bombs
- Display "Wow" face when the board is clicked
- Add UI for difficulty selection
- Polish documentation
- Publish