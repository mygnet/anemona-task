# Change Log

## [0.1.0] - 2022-08-15
- You can customize the colors of the vscode activityBar in order to quickly identify the workspace.
- Changed the options to add more additional fields for the password manager.

## [0.0.9] - 2022-08-10
- There are GitLab users who can only generate internal and public snippets, for this reason they cannot create private keychains, so the option has been added so that if it does not allow generating private snippets, try immediately with the internal level.
- In the event that a snippet is deleted directly from gitlab, the option to remove it from the list when trying to open it and it does not exist and returns a 404 error has been implemented.

## [0.0.8] - 2022-08-09
- Validation so that only attached images can be sent in the comments.
- The language of the extension is adjusted to the i18n and package.nls standards and is changed when the vscode language is chosen, although there is the possibility of executing the command: ctr+shit+P "anemona.task: Language: Spanish" o "anemona.task: Language: English" this is restored when opening the VSC again with its default language.
- One used for developers in general was incorporated, a password keychain where cryptography is used to store it in gitlab documents in snippets, 256-bit AES is used for encryption with a key that is calculated with the unique metadata at the time of creation the keychain.
- Keychains. There is no limit to add the keychains, they can be edited, deleted and protected
- When opening the keychains, it will be possible to define some optional fields that complement the password to have better organized access information.
- When assigning a personalized password to the keychain, you must be careful to remember it, since there is no way to recover the information from the encrypted keychain, since the password is not stored, it is only used as a master key to encrypt the data.
- Options to order the listings considering the title field of the password.
- Options to export the keychain content to clear text, encrypted, and json format.

## [0.0.7] - 2022-08-04

- Added indicators of overdue tasks and tasks to the time limit.
- A bar was added for each task that decreases when the end date approaches.
- Added the option to define a start date, otherwise the incident creation date is taken.
- The dashboard added the option to record the global progress that is recorded for each of the tasks (incidence)
- Added option to pause/activate a task(issue)
- Added a calendar view where projects with pending and paused tasks (incidents) are marked and listed.
- In the comments section, the option to add attached images was enabled (to view them it is necessary to uncheck the option in the general configuration of the project in gitlab in versions 15.3.0 in Visibility, project features, permissions: the checkbox of "Require authentication to view media files").
- In the View where the comments are shown, a list of logs was added that the gitlab registers the changes of the task (incidence).
- Fixed the error that did not allow exiting the session when doing a logout and reopening the session.
- Fixed the error that when adding a task (incident) or assigning it, it did not return to the list.

## [0.0.6] - 2022-07-20

- Fixed error when installing version 0.0.5 for the first time without previous versions.
- Fixed error opening task (problem) with double click.

## [0.0.5] - 2022-07-14

- Fixed the error when opening the task (issue) in the tab

## [0.0.4] - 2022-07-14

- Persistent user session globally
- The activities and selection of the projects are maintained by workspaces
- Improvements and optimizations in general

## [0.0.3] - 2022-07-11

- The problem of the Reload that hid the extension is corrected
- Fix persistent progress scrolling on logout
- Added view in a task tab (issue)
- Added options to make comments on tasks (issues)
- The system incident notes (logs) are incorporated
- Important closing and update dates are added according to the status of the task (issue))
- Error handler is made for unexpected events
- Improvements and optimizations in general

## [0.0.2] - 2022-07-04

- Report the percentage of general progress in the dashboard
- Improvements and optimizations in general

## [0.0.1] - 2022-06-04

- Task management (issues) for GitLab
- Connects to private and public HTTP and HTTPS servers.
- Dashboard statistics per project.
- Project search to select it.
- List of Tasks (incidents) indicated and delegated
- Task filters by priority and status
- Record task progress
- Close or Open task (issues)
- Add more task and assign them to project users
- Edit tasks (issues)
- Rank the importance of tasks
- Detect administrator privileges
- English and Spanish language
- Possibility of enabling an api services to perform administrator actions
- (Admin) Change avatar image
- (Admin) Delete a task
