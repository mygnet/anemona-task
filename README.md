# **Anemona Task GitLab**
[![Changelog](https://img.shields.io/badge/CHANGELOG-0.1.0-orange)](https://github.com/mygnet/anemona-task/blob/main/CHANGELOG.md)
[![license](https://img.shields.io/badge/LICENSE-MIT-blue)](https://github.com/mygnet/anemona-task/blob/main/LICENSE)
[![readme](https://img.shields.io/badge/README-Spanish-green)](README-es.md)

VS Code extension that handles GitLab issues such as activities and tasks that can be assigned, delegated among the group of members of a GitLab version control project, have a dashboard with progress statistics, all this in the floating sidebar o vscode panel, you also have a calendar with pending tasks of all assigned projects.

A very essential utility for us developers is also incorporated, which is a password keychain, to have it available in our workspace, taking advantage of the documents that can be created as GitLab snippets, these are encrypted with AES 256 bits, with two levels of encryption, the first level is with unique and own metadata of the keychain when it is generated, and the second level is encrypted with a master password that is not saved, it is only used to lock and unlock the keychain, something important is that the saved snippets in gitlab they are totally private, only the owner user can have access.

![Issues](/assets/github/00-dash.gif)


## **Features**
- Task management (issues) for GitLab
- Comments by tasks (incidents)
- Attach images in comments
- Connects to private and public HTTP and HTTPS servers.
- Dashboard of statistics by project.
- Project search to select it.
- List of Tasks (incidents) assigned and delegated
- Calendar and to-do events of all projects
- Task filters by priority and status
- Record task progress
- Pause/Activate task (incidents)
- Close or Open task (incidents)
- Indicators of tasks (incidents) due or close to due
- Bar indicator that runs out when the time is up
- Add more task and assign them to project users
- Edit tasks (issues)
- Classify the importance of tasks
- Detect administrator privileges
- English and Spanish language
- (Admin) Change avatar image
- (Admin) Delete a task

### **Password Keychain**
- There is no limit of keychains
- You can edit, Delete and Sort the general keychains
- Within the keychain there is no limit to the passwords or keys that can be added
- Can be edited, deleted and sorted
- Can be locked/unlocked with a master password, two-level encryption is generated
- Keys can be exported to plain text, json and encrypted format.

## **How ​​to use**

The extension is very easy and intuitive to use and works in the sidebar panel:

### **Change language**
At this time only English and Spanish are enabled
![Issues](/assets/github/03-lang.gif)

### **Log in**
You are required to have a **GitLab** version control account, it can be from any private or public server ([gitlab.com](https://gitlab.com) or other server), and generate your ] **Access Token**.

To generate the **Access Token** you can go on your GitLab server to the **Edit Profile** option, then in the sidebar go to the **Access Tokens** option, enter the values ​​to the fields **Token name**, **Expiration Date** and select **Select Scope** at least the first box as shown in the following image:
![Issues](/assets/github/access-token.gif)

Once your **Access Token** has been generated, you can use it to log in as follows:

![Issues](/assets/github/02-login.gif)

### **Board**
After logging in, the dashboard with the progress statistics of the selected version control project tasks (issues) will be displayed in the side panel.
![Issues](/assets/github/04-dash.gif)

### **List**
Once the project is selected, you will be able to see the tasks (Issues) classified and prioritized in the form of a list where you can register the progress, close or open the task and apply filters for its visualization.
![Issues](/assets/github/05-task.gif)

### **Add tasks(issues)**
In the same project or another previously selected one, you can add tasks (issues) as follows:
![Issues](/assets/github/06-task-new.gif)

### **Edit tasks(issues)**
If you are the creator of the task (incidence), the options to edit the task will appear in the form of 3 points at the top of the task.
![Issues](/assets/github/07-task-edit.gif)

### **Pause and activate tasks(issues)**
Although it is not exactly a gitlab functionality, but it can be simulated by adding a "paused" tag in this way a task (issue) can be paused.
![Issues](/assets/github/08-task-paused.gif)

### **Calendar of pending events and tasks(incidents)**
If you are one of those programmers who have several projects at the same time, this view can help you
to give you an idea of the earrings you have.
![Issues](/assets/github/09-task-events.gif)

### **Comments to the tasks(incidents)**
Something very important is to add notes or comments to a task (incidence) as well as attach some images to be able to document the work that is done on them.

(**Important**: You have to uncheck the box in gitlab: "Require authentication to view media files" of the project so you can see the images, after the example I put what you have to do to uncheck the box.)

![Issues](/assets/github/10-task-comments.gif)

Uncheck the project box in GitLab:
![Issues](/assets/github/12-git-file.gif)
### **Administrator permission**
If you have administrator permissions, then you will be able to perform some operations exclusive to this role.
- Delete tasks (issues) added by me.
- Change avatar image
- Edit username
![Issues](/assets/github/11-admin.gif)

### **GitLab issues**
Let's take a look at the GitLab version control server issues that were added, edited from the vsc extension.
![Issues](/assets/github/issues.jpg)


## **Password Keychain**

### **Generate a password keychain**

Password management is very simple and intuitive, as the process of adding a keychain is shown in the image.

![Issues](/assets/github/k0-add.gif)

### **Options in password keychains**

Basically there are some generic options, add, edit and order the keychains and list of passwords, it can be noted that they can lock the keychains with a master password.

![Issues](/assets/github/k0-options.gif)

### **Export Keychains**

As a utility is the option to export the keychains to simple plain text, json and encrypted files.

![Issues](/assets/github/k0-export.gif)

### **Looking at the snippets inside gitlab**
As you can see, the content is never sent in clear text, at all times it is stored encrypted and in a private mode where only the user can have access from gitlab.

![Issues](/assets/github/k0-gitlab.gif)


### *Change control*

See [CHANGELOG.md](https://github.com/mygnet/anemona-task/blob/main/CHANGELOG.md)

### *License*

See [LICENSE](https://github.com/mygnet/anemona-task/blob/main/LICENCE)