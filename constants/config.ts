/**
 * The default base URL for the Radicle Explorer
 *
 * Used for linking to public repositories
 */
export const defaultRadicleExplorerBaseUrl = 'https://explorer.radicle.gr/'

/**
 * The default origin for the app hosting the iframe for this app
 *
 * Used for linking to the host app
 */
export const defaultHostAppOrigin = 'http://localhost:3080'

/**
 * The length of the hash value to keep when shortening it.
 *
 * Used for visual reference and should not be used for machine matching.
 */
export const truncatedHashLength = 7

/**
 * The columns that are initially available in the board.
 */
export const initialColumns = ['non-planned', 'todo', 'doing', 'done']

/**
 * The increment value for task priority.
 *
 * Used to determine the priority of a task when moved to the bottom of a column.
 */
export const taskPriorityIncrement = 100
