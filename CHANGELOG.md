# Radicle Planning Boards Change Log

## **v0.2.0** - Jul 3rd 2024

### 🚀 Enhancements

- Add support for filtering via a text field
  - Uses partial string matching on the id, title, and labels of cards
  - Filters the cards while keeping their column and order
  - Visually highlights the matched substring(s) on each card
  - Features shortcuts for focusing and blurring the filterbox (`Ctrl/Cmd+F` and `Escape`
  respectively)
  - Filtering state synced with and driven by the URL means that any links you copy at any
  time and send to others will result in the same cards shown on their screen

### 🧹 Chores

- Add docker container packaging configuration
- Set up unit testing
- Update packages

## **v0.1.0** - Apr 23rd 2024

### 🚀 Enhancements

- Display loader during initial fetch
- Display task labels
- Filter out done tasks older than 2 weeks
- Update design to better align with radicle-interface
- Update issue creation permissions based on label write access
- Add about link to radicle-interface repo
- Add support for patches
- Adjust styles to accommodate new radicle-interface layout
- Column reordering
- Persist issue order
- Create a new card in existing column
- Support authenticated requests to httpd
- Show the status of an issue on its card
- Sort closed issues into the done column
- Clicking on an issue card's title opens the issue in a new tab
- Show issues from httpd instead of mock data
- Allow moving a card across columns
- Radicle issue cards (mock data) shown in columns
- Theme-ability

### 🔥 Performance

- Introduce optimistic updates for moving cards

### 🧹 Chores

- Align color palette with radicle-interface
- Update packages
- Create httpd client architecture
- Integrate boards with radicle-interface's UI

### 📚 Documentation

- Introduce CHANGELOG.md
- Enhance README.md
