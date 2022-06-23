# **Anemona Task GitLab**
VS Code extension that manages GitLab issues with appearance of featured tasks, delegated tasks and progress statistics in the floating sidebar or dashboard of vsc.

![Issues](/assets/github/screenshot.gif)


## **Features**
- Task management (issues) for GitLab
- Connects to private and public HTTP and HTTPS servers.
- Dashboard statistics per project.
- Project search to select it.
- List of Tasks (incidents) indicated and delegated
- Task filters by priority and status
- Record task progress
- Close or Open task (incidents)
- Add more task and assign them to project users
- Edit tasks (issues)
- Rank the importance of tasks
- Detect administrator privileges
- English and Spanish language
- Possibility of enabling an api services to perform administrator actions
- (Admin) Change avatar image
- (Admin) Delete a tare |


## **How ​​to use**

The extension is very easy and intuitive to use and works in the sidebar panel:

### **Change language**
At this time only English and Spanish are enabled
![Issues](/assets/github/lang.gif)

### **Log in**
You are required to have a **GitLab** version control account, it can be from any private or public server ([gitlab.com](https://gitlab.com) or other server), and generate your ] **Access Token**.

To generate the **Access Token** you can go on your GitLab server to the **Edit Profile** option, then in the sidebar go to the **Access Tokens** option, enter the values ​​to the fields **Token name**, **Expiration Date** and select **Select Scope** at least the first box as shown in the following image:
![Issues](/assets/github/access-token.gif)

Once your **Access Token** has been generated, you can use it to log in as follows:

![Issues](/assets/github/login.gif)

### **Board**
After logging in, the dashboard with the progress statistics of the selected version control project tasks (issues) will be displayed in the side panel.
![Issues](/assets/github/sel-project.gif)

### **List**
Once the project is selected, you will be able to see the tasks (Issues) classified and prioritized in the form of a list where you can register the progress, close or open the task and apply filters for its visualization.
![Issues](/assets/github/list-tasks.gif)

### **Add tasks(issues)**
In the same project or another previously selected one, you can add tasks (issues) as follows:
![Issues](/assets/github/new-task.gif)

### **Edit tasks(issues)**
If you are the creator of the task (incidence), the options to edit the task will appear in the form of 3 points at the top of the task.
![Issues](/assets/github/edit-task.gif)

### **Administrator permission**
Only with administrator permissions can some exclusive operations be performed for this role.
- Delete tasks (issues) added by me.
- Change avatar image
- Edit username

If you have the administrator role you will be able to perform these actions, and as an alternative there is a field when you log in that is optional, it is to specify a service API to perform these administrator actions through the API.
![Issues](/assets/github/admin.gif)


### **GitLab issues**
Let's take a look at the GitLab version control server issues that were added, edited from the vsc extension.
![Issues](/assets/github/issues.jpg)

### *Change control*

See [CHANGELOG.md](https://github.com/CHANGELOG.md)

### *License*

See [LICENSE](https://github.com/LICENCE)