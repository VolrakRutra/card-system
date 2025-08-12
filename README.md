# Card System Demo

This project represents the humble beginnings of a system that could be used as a foundation for a card-based game rendered in beautiful 3D in the browser.

Entry point is `main.ts`.

Core classes are:
- `Card`
  - Represents a card. A card is a double-sided mesh, which can be highlighted when hovered. 
  - A card can be flipped, rotated, and moved
  - Card is shaded using `THREE.ShaderMaterial`, shader data is found in `./shaders`
- `CardAtlas`
  - Represents the texture data that is used to draw cards' faces and backs. 
  - Provides helper methods for figuring out the UV position of a card. 
  - Pre-created atlases can be found in `atlasData.ts`
- `Layout`
  - Represents a collection of positions and orientation of cards. 
  - Provides a helper method `render()` to display the card positions.
  - Pre-created layouts are found in `layouts.ts`
- `Deck`
  - Represents a deck of cards. 
  - Tracks three card piles
    - `available` - cards still in the deck
    - `drawn` - cards that are in play
    - `discarded` - cards in discard pile

Additional files are:
- `Sketch.ts`
  - Represents shared logic of setting up the scene and related components.
- `MenuHandler.ts`
  - Handles the logic of the main menu
- `icons.ts`
  - Provides some icons borrowed from the amazing [icones.js.org](https://icones.js.org/) website.
- `web-components/ContextMenu.ts`
  - Context menu invoked when right-clicking on the card is a Web Component. Web Components are very cool!
- `demos` folder
  - Contains several demos that are used in the project.
  - A demo combines the shared logic of a `Sketch` with some custom event handlers and additional game-specific logic.

## TODO

- Shuffle animation
- MacMahon: fix click without drag bug.