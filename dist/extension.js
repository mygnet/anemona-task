(()=>{"use strict";var e={119:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.SidebarProvider=void 0;const n=s(496),o=s(855),r=s(286),a=s(596),c=s(313),d=s(797),h=s(554);t.SidebarProvider=class{constructor(e,t){this._context=e,this.core=t,this.core=t,this._extensionUri=this._context.extensionUri}page(e){this.command({command:e,data:{}})}command(e){return i(this,void 0,void 0,(function*(){const t=(e=e||{}).command.split("/");switch(this.core.initLang(),t.shift()){case"session":return this.core.session(t,e);case"project":return r.default.self(this.core,t,e);case"user":return a.default.self(this.core,t,e);case"task":return c.default.self(this.core,t,e);case"page":return d.default.self(this.core,t,e);case"web-task":return h.default.self(this.core,t,e)}switch(e.command){case"reloads":h.default.reload();case"reload":return this.core.postCmd("reload");case"onInfo":return this.core.winMsgInfo(e.content);case"onError":return this.core.winMsgError(e.content)}}))}resolveWebviewView(e){var t;this._view=e,null===(t=this.core)||void 0===t||t.setView(e),e.webview.options={enableScripts:!0,localResourceRoots:[this._extensionUri]},e.webview.html=this._getHtmlForWebview(e.webview),e.webview.onDidReceiveMessage((e=>i(this,void 0,void 0,(function*(){return yield this.command(e)}))))}revive(e){this._view=e}_getHtmlForWebview(e){this.core.path=""+e.asWebviewUri(n.Uri.joinPath(this._extensionUri));const t=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"assets","css/reset.css")),s=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"dist","App.css")),i=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"assets","css/vscode.css")),r=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"assets","plugins/basscss/basscss.min.css")),a=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"assets","plugins/fontawesome-6/css/all.min.css")),c=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"dist","App.js")),d=(0,o.getNonce)();return`<!DOCTYPE html>\n\t  <html lang="en">\n\t  \t<head>\n\t  \t    <meta charset="UTF-8">\n          <meta http-equiv="Content-Security-Policy" content=" font-src ${e.cspSource}; style-src ${e.cspSource}; script-src 'nonce-${d}';">\n\t  \t    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n\t  \t    <link href="${t}" rel="stylesheet">\n\t  \t    <link href="${i}" rel="stylesheet">\n          <link href="${s}" rel="stylesheet">\n          <link href="${r}" rel="stylesheet">\n          <link href="${a}" rel="stylesheet">\n\t  \t</head>\n        <body id="sidebar">\n           <script nonce="${d}" src="${c}"><\/script>\n\t  \t</body>\n\t  </html>`}}},779:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const n=s(496),o=s(855);class r{constructor(e,t,s){this.id=e,this.core=t,this._disposables=[],this.title="Anemona task gitlab",this._panel=s,this._extensionUri=this.core.context.extensionUri,this._update(),this._panel.onDidDispose((()=>this.dispose()),null,this._disposables),this._panel.onDidChangeViewState((e=>this._panel.visible&&this._update()),null,this._disposables)}static getWebviewOptions(e){return{enableScripts:!0,localResourceRoots:[n.Uri.joinPath(e,"assets"),n.Uri.joinPath(e,"dist")]}}static setRegister(e,t,s){n.window.registerWebviewPanelSerializer&&n.window.registerWebviewPanelSerializer(t.name+"."+e,{deserializeWebviewPanel(e,n){return i(this,void 0,void 0,(function*(){e.webview.options=r.getWebviewOptions(t.context.extensionUri),s(e)}))}})}static activeColumn(){return n.window.activeTextEditor?n.window.activeTextEditor.viewColumn:void 0}static createWebview(e,t){const s=r.activeColumn();return n.window.createWebviewPanel(t.name+"."+e,"Anemona",s||n.ViewColumn.One,r.getWebviewOptions(t.context.extensionUri))}received(e){this._panel.webview.onDidReceiveMessage((t=>{if("session"===t.command.split("/").shift())return this.sessionLoad(t);e(t)}),null,this._disposables)}setTitle(e){this.title=e,this._panel.title=this.title}reveal(e){this._panel.reveal(e)}sessionLoad(e){this.core.initLang(),this.core.user=this.core.user||{},this.core.user.lang=this.core.lang,this.postCmd(e.command,this.core.user||{})}postCmd(e,t={}){this._panel.webview.postMessage({cmd:e,dat:t})}dispose(){for(this._panel.dispose();this._disposables.length;){const e=this._disposables.pop();e&&e.dispose()}}_update(){const e=this._panel.webview;this._panel.title=this.title,this._panel.webview.html=this._getHtmlForWebview(e)}_getHtmlForWebview(e){this.core.path=""+e.asWebviewUri(n.Uri.joinPath(this._extensionUri));const t=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"assets","css/reset.css")),s=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"dist","App.css")),i=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"assets","css/vscode.css")),r=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"assets","plugins/basscss/basscss.min.css")),a=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"assets","plugins/fontawesome-6/css/all.min.css")),c=e.asWebviewUri(n.Uri.joinPath(this._extensionUri,"dist","App.js")),d=(0,o.getNonce)();return`<!DOCTYPE html>\n          <html lang="en">\n            <head>\n              <meta charset="UTF-8">\n              <meta http-equiv="Content-Security-Policy" content=" font-src ${e.cspSource}; style-src ${e.cspSource}; script-src 'nonce-${d}';">\n              <meta name="viewport" content="width=device-width, initial-scale=1.0">\n              <link href="${t}" rel="stylesheet">\n              <link href="${i}" rel="stylesheet">\n              <link href="${s}" rel="stylesheet">\n              <link href="${r}" rel="stylesheet">\n              <link href="${a}" rel="stylesheet">\n            </head>\n            <body id="${this.id}">\n               <script nonce="${d}" src="${c}"><\/script>\n              </body>\n          </html>`}}t.default=r},554:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const n=s(779),o=s(313),r=s(67);class a extends n.default{constructor(e,t){super(a.id,e,t),super.received((e=>this.command(e)))}static reload(){if(a.me)return a.me.postCmd("reload")}static remoteData(e){var t;return i(this,void 0,void 0,(function*(){let s=a.data||e.get("task")||{};return s=yield null===(t=e.req)||void 0===t?void 0:t.getJson("/api/v4/projects/"+s.idProject+"/issues/"+s.id),s=o.default.regData(s),s.project=e.get("project")||{},a.data=s,e.set("remote task:",s),s}))}static closed(){if(a.me)return a.me.postCmd("closed")}static setData(e,t){a.data=t||e.get("task")||{},a.data.project=e.get("project")||{},e.set("task",t)}static self(e,t,s){switch(t.shift()){case"closed":return a.closed();case"comments":return a.createOrShow(e,s);case"refresh":if(a.data&&a.data.id&&s.content.id===a.data.id)return a.setData(e,s.content),a.reloadOrShow()}}static reloadOrShow(){return!!a.me&&(a.me.setTitle(a.data.title),a.me.reveal(n.default.activeColumn()),a.me.postCmd("reload"),!0)}static createOrShow(e,t){a.setData(e,t.content),a.reloadOrShow()||(a.me=new a(e,n.default.createWebview(a.id,e)),a.me.setTitle(a.data.title))}static revive(e,t){a.me=new a(e,t),a.me.postCmd("reload")}static register(e){n.default.setRegister(a.id,e,(t=>{a.revive(e,t)}))}taskLoad(e){return i(this,void 0,void 0,(function*(){yield a.remoteData(this.core),this.setTitle(a.data.title),this.postCmd(e.command,a.data||{})}))}commentsLoad(e){var t;return i(this,void 0,void 0,(function*(){const s=e.content,i="/api/v4/projects/"+s.idProject+"/issues/"+s.id+"/notes?sort=asc&order_by=updated_at",n=yield null===(t=this.core.req)||void 0===t?void 0:t.jsonPage(i),o={notes:[],comments:[]};for(const e in n)n[e].system?o.notes.push({createdAt:(0,r.isoToDate)(n[e].created_at),body:n[e].body}):o.comments.push({author:n[e].author,createdAt:(0,r.isoToDate)(n[e].created_at),body:n[e].body});this.postCmd(e.command,o||{})}))}commentAdd(e){var t;return i(this,void 0,void 0,(function*(){const s=e.content,i={id:s.idProject,issue_iid:s.idIssue,body:s.body};let n=yield null===(t=this.core.req)||void 0===t?void 0:t.getJson("/api/v4/projects/"+s.idProject+"/issues/"+s.idIssue+"/notes",i),o={};n&&(o={author:n.author,createdAt:(0,r.isoToDate)(n.created_at),body:n.body}),this.core.postCmd("reload"),this.postCmd(e.command,o)}))}command(e){switch((e=e||{}).command){case"task/load":return this.taskLoad(e);case"comments/load":return this.commentsLoad(e);case"comments/add":return this.commentAdd(e)}}dispose(){a.me=void 0,super.dispose()}}t.default=a,a.id="web-task"},850:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const n=s(552),o=s(496);t.default=class{constructor(e,t,s,i){this.name=e,this.context=t,this.view=s,this.req=i,this.lang="en",this.cmdExe=o.commands.executeCommand,this.cmdReg=o.commands.registerCommand,this.sess={id:e+".session",token:"",host:"",service:""},this.path="",this.user=null,this.setMenu(1)}get(e){return this.getStsGlobal(this.sess.id+e)}set(e,t){this.setStsGlobal(this.sess.id+e,t)}updSession(e){this.dataSession(this.sess.host,this.sess.token,this.sess.service,e)}loadSession(){this.user=this.user?this.user:this.getStsGlobal(this.sess.id)}dataSession(e,t,s,i){this.user={allow:!(!i.is_admin&&!s),token:t,host:e,service:s,id:i.id,email:i.email,isAdmin:i.isAdmin||i.is_admin,username:i.username,name:i.name,lastActivity:i.lastActivity||i.last_activity_on,webUrl:i.webUrl||i.web_url,avatarUrl:i.avatarUrl||i.avatar_url},this.setStsGlobal(this.sess.id,this.user)}authSession(e,t,s){return i(this,void 0,void 0,(function*(){this.req=new n.default(e,t,"");const i=yield this.req.getJson("/api/v4/user");if(i&&i.id){const n=yield this.req.getJson("/api/v4/projects/185/badges?name=api"),o=n instanceof Array&&n.length&&n[0]?n[0].link_url:s||"";return this.req.setService(o),this.dataSession(e,t,o,i),this.setSession(this.user),!0}return i&&i.message&&this.winMsgError(i.message),!1}))}loginSession(e,t){return i(this,void 0,void 0,(function*(){e&&(yield this.authSession(e.host,e.token,e.service))?t(this.user,2):t(null,1)}))}setSession(e){this.sess.token=e.token,this.sess.host=e.host,this.sess.service=e.service,this.user=e,this.req=this.req?this.req:new n.default(e.host,e.token,e.service)}initSession(e,t){this.setSession(e),t({success:!0,lang:this.lang},2)}dropSession(e){this.sess.token="",this.sess.host="",this.sess.service="",this.user=null,e({success:!0},1)}routeSession(e,t,s){switch(e.shift()){case"init":return this.initSession(t,s);case"drop":return this.dropSession(s);case"login":return this.loginSession(t,s)}}session(e,t){const s="session/"+e.join("/");this.postCmd("lang",this.lang),this.routeSession(e,t.content,((e,t)=>{this.setMenu(t),this.postCmd(s,e||{})}))}initLang(){this.lang=this.getStsGlobal("lang")||"en"}loadLang(e,t){this.postCmd(t.command,this.lang)}setLang(e){this.lang=e,this.setStsGlobal("lang",e)}getStsGlobal(e){return this.context.globalState.get(e)}setStsGlobal(e,t){this.context.globalState.update(e,t)}delStsGlobal(e){this.context.globalState.update(e,void 0)}setCtx(e,t){this.cmdExe("setContext",this.name+"."+e,t)}setMenu(e){"es"===this.lang&&(e=1===e?3:2===e?4:0),this.setCtx("idMenuOption",e)}postCmd(e,t={}){var s;null===(s=this.view)||void 0===s||s.webview.postMessage({cmd:e,dat:t})}setRequest(e){this.req=e}setView(e){this.view=e}request(){return this.req}winMsgInfo(e){e&&o.window.showInformationMessage(e)}winMsgError(e){e&&o.window.showErrorMessage(e)}winOpenImage(){return i(this,void 0,void 0,(function*(){return yield o.window.showOpenDialog({title:"es"===this.lang?"Selecciona una imagen":"Select an image",canSelectFiles:!0,canSelectFolders:!1,canSelectMany:!1,filters:{Images:["png","jpg"]}})}))}}},61:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0}),t.Services=void 0;const n=s(496),o={};class r{constructor(e){this.core=e,this.core.loadSession(),this.core.user&&this.core.setSession(this.core.user),this.setWorkSpace(),this.onEvents()}static register(e){r.me||(r.me=e?new r(e):void 0)}static dispose(){r.me&&r.me.update()}setWorkSpace(){var e;o.name&&o.name===n.workspace.name||(o.name=n.workspace.name||"vsc",o.path=(null===(e=n.workspace.workspaceFolders)||void 0===e?void 0:e.length)?n.workspace.workspaceFolders[0].uri.fsPath:"",""!==o.path&&this.send("workspace",{name:o.path.split("\\").join("/")}),o.data={})}send(e,t){var s;return i(this,void 0,void 0,(function*(){(t=t||{}).space=o.name,yield null===(s=this.core.req)||void 0===s?void 0:s.service("/working/"+e,t)}))}setFile(e,t){this.setWorkSpace();const s=t.fileName.replace(o.path,"").split("\\").join("/"),i=o.data[s]||{};"open"===e?i[e]=i[e]?i[e]:t.lineCount:i.save!==t.lineCount&&(i.save=t.lineCount,i.open=i.open||i.save,i.open-i.save&&this.send("save",{name:s,ln:[i.open,i.save]})),o.data[s]=i}onEvents(){this.saveFile=n.workspace.onDidSaveTextDocument((e=>{const t=n.window.activeTextEditor;t&&t.document.fileName===e.fileName&&this.setFile("save",e)})),this.openFile=n.window.onDidChangeActiveTextEditor((e=>e&&this.setFile("open",e.document)))}update(){this.openFile&&this.openFile.dispose(),this.saveFile&&this.saveFile.dispose()}}t.Services=r},797:function(e,t){var s=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});class i{constructor(e){this.core=e}static self(e,t,s){return i.me||(i.me=e?new i(e):void 0),i.me&&t&&i.me.router(t,s),i.me}router(e,t){return s(this,void 0,void 0,(function*(){switch(e.shift()){case"logout":return this.core.postCmd("page/logout");case"login":return this.core.postCmd("page/login");case"profile":return this.core.postCmd("page/profile");case"dash":return this.core.postCmd("page/dash");case"tasks":return this.core.postCmd("page/tasks");case"users":return this.core.postCmd("page/users");case"projects":return this.core.postCmd("page/projects");case"langEs":return this.changeLanguage("es");case"langEn":return this.changeLanguage("en")}}))}changeLanguage(e){return s(this,void 0,void 0,(function*(){this.core.setLang(e),this.core.user&&this.core.user.id?this.core.setMenu(2):this.core.setMenu(1),yield this.core.cmdExe(this.core.name+".refresh-en")}))}}t.default=i},286:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const n=s(709);class o{constructor(e){this.core=e}static self(e,t,s){return o.me||(o.me=e?new o(e):void 0),o.me&&t&&o.me.router(t,s),o.me}router(e,t){return i(this,void 0,void 0,(function*(){if("search"===e.shift())return this.search(t)}))}search(e){var t;return i(this,void 0,void 0,(function*(){const s=e.content;let i=yield null===(t=this.core.req)||void 0===t?void 0:t.getJson("/api/v4/projects?membership=true&search="+s.key);i=(0,n.getList)(i,e.format),this.core.postCmd(e.command,i)}))}}t.default=o},552:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const n=s(477),o=s(685),r=s(687),a=s(310),c=s(147),d=s(17),h=s(746);t.default=class{constructor(e,t,s){this.api=e,this.token=t,this.apiService=s,this.lastError="";const i=new a.URL(this.api);this.host=i.hostname,this.protocol=i.protocol,this.port=this.protocol.indexOf("https")>-1?"443":i.port?i.port:"80",this.path=i.pathname,this.allow=null,this.httpRequest=this.protocol.indexOf("https")>-1?r.request:o.request,this.httpRequestService=this.protocol.indexOf("https")>-1?r.request:o.request,this.getHttp=this.protocol.indexOf("https")>-1?r.get:o.get}getTypeContent(e){switch(e){case"json":return"application/json; charset=UTF-8";case"x-form":return"application/x-www-form-urlencoded; charset=UTF-8";case"form":return"application/form-data; charset=UTF-8"}return e}setAllow(e=null){this.allow=e}getHeaders(e="json",t){const s={"PRIVATE-TOKEN":this.allow?this.allow:this.token,"Content-Type":this.getTypeContent(e)};return t&&(s["Content-Length"]=Buffer.byteLength(t)),s}getOptions(e,t,s="json"){return e=this.path.substring(1)+e,{host:this.host,port:this.port,path:e,method:t,headers:this.getHeaders(s,0)}}getOptionsService(e,t,s="json"){const i=new a.URL(this.apiService);this.httpRequestService=i.protocol.indexOf("https")>-1?r.request:o.request;const n=i.protocol.indexOf("https")>-1?"443":i.port?i.port:"80";return{host:i.hostname,port:n,path:i.pathname+e,method:t,headers:this.getHeaders(s,0)}}send(e,t,s="GET"){return new Promise(((i,o)=>{let r=this.getOptions(e,s),a="";t&&(a=(0,n.stringify)(t),r.method="GET"===s?"POST":s,r.headers=this.getHeaders("x-form",a));let c=this.httpRequest(r,(e=>{if(e.setEncoding("utf8"),e.statusCode>=200&&e.statusCode<=299){let t="";e.on("data",(e=>{t+=e})),e.on("end",(()=>{i(t)}))}else this.lastError="Cannot connect to fields entered ",o("Error: "+e.statusMessage+" ("+e.statusCode+") ")}));c.on("error",(e=>{this.lastError="Can't connect to api host:"+this.api,o(e)})),a&&c.write(a),c.end()}))}service(e,t,s,n="POST",o=!1){return i(this,void 0,void 0,(function*(){return new Promise(((i,r)=>{if(!this.apiService)return i({success:!1});const a="zE9Ecx45f41KqWGUxz4b";let c=[];if(t)for(const e in t)c.push(this.addBoundary(a,"D",e,t[e]));if(s)for(const e in s)c.push(this.addBoundary(a,"F",e,s[e])),c.push(this.addBoundaryBinary(s[e])),c.push(Buffer.from("\r\n","utf8"));c.push(this.endBoundary(a));const d=Buffer.concat(c),h="multipart/form-data; boundary="+a,l=o?this.getOptions(e,n,h):this.getOptionsService(e,n,h);let u="";const p=this.httpRequestService(l,(e=>{e.on("data",(e=>u+=e)),e.on("end",(()=>{try{i(u?JSON.parse(u):u)}catch(e){r(e.message)}}))}));p.on("error",(e=>{r(e.message)})),p.write(d),p.end()}))}))}sendAllow(e,t,s,n="POST",o=!1){return i(this,void 0,void 0,(function*(){if(this.apiService){let i={},o={};try{o=yield this.service("/allow",{id:0})}catch(e){i.success=!1,i.message=e}if(o&&o.success&&o.data){this.setAllow(o.data);try{i=yield this.service(e,t,s,n,!0)}catch(e){i.success=!1,i.message=e}this.setAllow(null)}return i}{const i=this.apiService+"";this.apiService=this.api+"";let o={};try{o=yield this.service(e,t,s,n,!0)}catch(e){o.success=!1,o.message=e}return this.apiService=i+"",o}}))}addBoundary(e,t,s,i){if("D"===t)return Buffer.from("--"+e+'\r\nContent-Disposition: form-data; name="'+s+'";\r\n\r\n'+i+"\r\n","utf8");if("F"===t){const t=(0,h.mimeType)((0,d.extname)(i));return Buffer.from("--"+e+'\r\nContent-Disposition: form-data; name="'+s+'"; filename="'+(0,d.basename)(i)+'"\r\nContent-Type: '+t+"\r\nContent-Type: application/octet-stream\r\n\r\n","utf8")}}setService(e){this.apiService=e}addBoundaryBinary(e){const t=(0,c.readFileSync)(e);return Buffer.from(t,"binary")}endBoundary(e){return Buffer.from("--"+e+"--\r\n","utf8")}jsonPage(e,t=[],s=0){return i(this,void 0,void 0,(function*(){return new Promise(((n,o)=>i(this,void 0,void 0,(function*(){const i=yield this.getJson(e+"&per_page=100&page="+(s+1));if(i&&i.message)return n([]);i.length<100?n(t.concat(i)):n(yield this.jsonPage(e,t.concat(i),s+1))}))))}))}getJson(e,t=null,s="GET"){return i(this,void 0,void 0,(function*(){let i="";try{return i=yield this.send(e,t,s),JSON.parse(i)}catch(e){return{message:e+", "+this.lastError}}}))}getB64(e){return i(this,void 0,void 0,(function*(){return new Promise(((t,s)=>{this.getHttp(e,(e=>{e.setEncoding("base64");let s="";e.on("data",(e=>{s+=e})),e.on("end",(()=>{t({data:s,contentType:e.headers["content-type"]})}))})).on("error",(e=>{s(`error: ${e.message}`)}))}))}))}getImgB64(e){return i(this,void 0,void 0,(function*(){const t=yield this.getB64(e);return"data:"+t.contentType+";base64,"+t.data}))}}},313:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const n=s(67);class o{constructor(e){this.core=e}static self(e,t,s){return o.me||(o.me=e?new o(e):void 0),o.me&&t&&o.me.router(t,s),o.me}static getPriority(e){return e.indexOf("alta")>=0?"alta":e.indexOf("media")>=0?"media":e.indexOf("baja")>=0?"baja":"none"}static calcProgress(e){let t=0;for(let s=0;s<=10;s++)t=e.indexOf((10*s).toString())>=0?10*s:t;return t}static regData(e){return{id:e.iid,idProject:e.project_id,title:e.title,description:e.description,state:e.state,createdAt:(0,n.isoToDate)(e.created_at),updatedAt:(0,n.isoToDate)(e.updated_at),closedAt:(0,n.isoToDate)(e.closed_at),closedBy:e.closed_by,labels:e.labels,assignee:e.assignee,comments:e.user_notes_count,priority:o.getPriority(e.labels||[]),progress:o.calcProgress(e.labels||[]),idUser:e.assignee?e.assignee.id:0,author:e.author,dueDate:e.due_date}}router(e,t){return i(this,void 0,void 0,(function*(){switch(e.shift()){case"get-statistics":return this.getStatistics(t);case"list":case"list-data-0":return yield this.list(t,0);case"list-data-1":return yield this.list(t,1);case"list-opened":return yield this.list(t,3);case"add":return this.add(t);case"del":return this.del(t);case"upd":return this.edit("upd",t);case"state":return this.edit("state",t);case"labels":return this.edit("labels",t)}}))}list(e,t=0,s){var n;return i(this,void 0,void 0,(function*(){let i={id:0,name:""},r="";e&&e.content&&e.content.id&&(i={id:e.content.id,name:e.content.name},this.core.set("project",i)),i.id&&(r="projects/"+i.id+"/"),s=3===t?"?assignee_id="+this.core.user.id+"&state=opened":1===t?"?author_id="+this.core.user.id:"?assignee_id="+this.core.user.id;const a=yield null===(n=this.core.req)||void 0===n?void 0:n.jsonPage("/api/v4/"+r+"issues"+s);let c=[];if(a instanceof Array&&a.length)for(const e in a)1===t&&a[e].assignee&&a[e].assignee.id===this.core.user.id||c.push(o.regData(a[e]));return this.core.postCmd(e.command,c)}))}add(e){var t;return i(this,void 0,void 0,(function*(){const s=e.content,i={id:s.idProject,assignee_id:s.idUser,title:s.title,description:s.description,due_date:s.date,labels:s.priority};let n=yield null===(t=this.core.req)||void 0===t?void 0:t.getJson("/api/v4/projects/"+s.idProject+"/issues",i);n&&(n=o.regData(n)),this.core.postCmd(e.command,n)}))}edit(e,t){var s;return i(this,void 0,void 0,(function*(){const i=t.content;let n={};i.id&&(n.issue_iid=i.id),i.idProject&&(n.id=i.idProject),"state"!==e&&"upd"!==e||i.state&&(n.state_event="closed"===i.state?"close":"reopen"),"labels"!==e&&"upd"!==e||i.labels&&(n.labels=i.labels.join(",")),"upd"===e&&(i.idUser&&(n.assignee_id=i.idUser),i.title&&(n.title=i.title),i.description&&(n.description=i.description),i.date&&(n.due_date=i.date));let r=yield null===(s=this.core.req)||void 0===s?void 0:s.getJson("/api/v4/projects/"+i.idProject+"/issues/"+i.id,n,"PUT");r&&(r=o.regData(r)),this.core.postCmd(t.command,r)}))}del(e){var t;return i(this,void 0,void 0,(function*(){const s=e.content,i=yield null===(t=this.core.req)||void 0===t?void 0:t.sendAllow("/api/v4/projects/"+s.idProject+"/issues/"+s.id,{},{},"DELETE"),n=i&&i.message?i:s;this.core.postCmd(e.command,n)}))}getStatistics(e,t){var s,n,o;return i(this,void 0,void 0,(function*(){const i=e.content;let r={id:0,name:""},a="";i.id&&(r={id:i.id,name:i.name},a="projects/"+i.id+"/"),this.core.set("project",r),t||(t="?assignee_id="+this.core.user.id);const c="/api/v4/"+a+"issues_statistics"+t+"&labels=",d=yield null===(s=this.core.req)||void 0===s?void 0:s.getJson(c+"baja"),h=yield null===(n=this.core.req)||void 0===n?void 0:n.getJson(c+"media"),l=yield null===(o=this.core.req)||void 0===o?void 0:o.getJson(c+"alta"),u={baja:this.dataStatistics(d),media:this.dataStatistics(h),alta:this.dataStatistics(l)};this.core.postCmd(e.command,u)}))}dataStatistics(e){let t={opened:0,closed:0};return e&&e.statistics&&(t={opened:e.statistics.counts.opened,closed:e.statistics.counts.closed}),t}setState(e){this.core.postCmd(e.command,{id:1001})}}t.default=o},596:function(e,t,s){var i=this&&this.__awaiter||function(e,t,s,i){return new(s||(s=Promise))((function(n,o){function r(e){try{c(i.next(e))}catch(e){o(e)}}function a(e){try{c(i.throw(e))}catch(e){o(e)}}function c(e){var t;e.done?n(e.value):(t=e.value,t instanceof s?t:new s((function(e){e(t)}))).then(r,a)}c((i=i.apply(e,t||[])).next())}))};Object.defineProperty(t,"__esModule",{value:!0});const n=s(709);class o{constructor(e){this.core=e}static self(e,t,s){return o.me||(o.me=e?new o(e):void 0),o.me&&t&&o.me.router(t,s),o.me}router(e,t){return i(this,void 0,void 0,(function*(){switch(e.shift()){case"avatar":return this.avatar(t);case"edit":return this.edit(t);case"list-by-project":return this.listByProject(t);case"get-data":return this.getData(t)}}))}getData(e){this.core.postCmd(e.command,this.core.user)}edit(e){var t;return i(this,void 0,void 0,(function*(){const s=e.content;let i;if(s.user)if(s.user.id=this.core.user.id,i=yield null===(t=this.core.req)||void 0===t?void 0:t.sendAllow("/api/v4/users/"+this.core.user.id,s.user,void 0,"PUT"),i&&i.message){const e=i.message?i.message:"No se puedo actualizar el campo...";this.core.winMsgError("Edit: "+e)}else{if(i&&i.id)return this.core.updSession(i),this.core.postCmd(e.command,this.core.user);this.core.winMsgError("Edit: Ocurrió un error, intenta mas tarde...")}this.core.postCmd(e.command)}))}avatar(e){var t;return i(this,void 0,void 0,(function*(){e.content;const s=yield this.core.winOpenImage();if(s&&s.length){const i=yield null===(t=this.core.req)||void 0===t?void 0:t.sendAllow("/api/v4/users/"+this.core.user.id,{id:this.core.user.id},{avatar:s[0].fsPath},"PUT",this.core.user.isAdmin);if(i&&i.message){const e=i.message.avatar?i.message.avatar.toString():i.message?i.message:"No se puedo actualizar el avatar...";this.core.winMsgError("Avatar: "+e)}else{if(i&&i.id)return this.core.updSession(i),this.core.postCmd(e.command,this.core.user);this.core.winMsgError("Avatar: Ocurrió un error, intenta mas tarde...")}}this.core.postCmd(e.command)}))}listByProject(e){var t;return i(this,void 0,void 0,(function*(){const s=e.content;let i=yield null===(t=this.core.req)||void 0===t?void 0:t.getJson("/api/v4/projects/"+s.id+"/users");i=(0,n.getList)(i,e.format),this.core.postCmd(e.command,i)}))}}t.default=o},67:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.isoToDate=void 0,t.isoToDate=function(e){const t=new Date(e),s=t.getFullYear(),i=t.getMonth()+1,n=t.getDate(),o=t.getHours(),r=t.getMinutes(),a=t.getSeconds();return s+"-"+(i<10?"0":"")+i+"-"+(n<10?"0":"")+n+" "+(o<10?"0":"")+o+":"+(r<10?"0":"")+r+":"+(a<10?"0":"")+a}},709:(e,t)=>{function s(e){let t=[];if(e)for(const s in e)void 0!==e[s].state&&"active"!==e[s].state||t.push({id:e[s].id,path:e[s].path_with_namespace||e[s].name||"none",value:e[s].name||e[s].title});return t}Object.defineProperty(t,"__esModule",{value:!0}),t.getList=t.getListOptions=void 0,t.getListOptions=s,t.getList=function(e,t="options"){return s(e)}},746:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.mimeType=void 0;const s={"application/geo+json":["geojson"],"application/json":["json","map"],"application/msword":["doc","dot"],"application/octet-stream":["bin","dms","lrf","mar","so","dist","distz","pkg","bpk","dump","elc","deploy","exe","dll","deb","dmg","iso","img","msi","msp","msm","buffer"],"application/pdf":["pdf"],"application/zip":["zip"],"audio/mpeg":["mpga","mp2","mp2a","mp3","m2a","m3a"],"audio/ogg":["oga","ogg","spx","opus"],"audio/wav":["wav"],"image/bmp":["bmp"],"image/gif":["gif"],"image/jpeg":["jpeg","jpg","jpe"],"image/png":["png"],"image/svg+xml":["svg","svgz"],"image/webp":["webp"],"text/css":["css"],"text/csv":["csv"],"text/html":["html","htm","shtml"],"text/plain":["txt","text","conf","def","list","log","in","ini"],"video/mp4":["mp4","mp4v","mpg4"],"video/mpeg":["mpeg","mpg","mpe","m1v","m2v"],"video/ogg":["ogv"],"video/quicktime":["qt","mov"],"video/webm":["webm"]};t.mimeType=function(e){e=e.replace(".","");for(const t in s)if(-1!==s[t].indexOf(e))return t;return null}},855:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.getNonce=void 0,t.getNonce=function(){let e="";const t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let s=0;s<32;s++)e+=t.charAt(Math.floor(Math.random()*t.length));return e}},496:e=>{e.exports=require("vscode")},147:e=>{e.exports=require("fs")},685:e=>{e.exports=require("http")},687:e=>{e.exports=require("https")},17:e=>{e.exports=require("path")},477:e=>{e.exports=require("querystring")},310:e=>{e.exports=require("url")}},t={};function s(i){var n=t[i];if(void 0!==n)return n.exports;var o=t[i]={exports:{}};return e[i].call(o.exports,o,o.exports,s),o.exports}var i={};(()=>{var e=i;Object.defineProperty(e,"__esModule",{value:!0}),e.deactivate=e.activate=void 0;const t=s(496),n=s(119),o=s(61),r=s(850),a=s(554);e.activate=function(e){const s=new r.default("vscode-anemona-task",e),i=s.name,c=new n.SidebarProvider(e,s);e.subscriptions.push(t.window.registerWebviewViewProvider(i+"-sidebar",c),s.cmdReg(i+".refresh-en",(()=>c.page("reloads"))),s.cmdReg(i+".login-en",(()=>c.page("page/login"))),s.cmdReg(i+".lang-en",(()=>c.page("page/langEs"))),s.cmdReg(i+".refresh-es",(()=>c.page("reloads"))),s.cmdReg(i+".login-es",(()=>c.page("page/login"))),s.cmdReg(i+".lang-es",(()=>c.page("page/langEn"))),s.cmdReg(i+".logout-en",(()=>c.page("page/logout"))),s.cmdReg(i+".home-en",(()=>c.page("page/dash"))),s.cmdReg(i+".tasks-en",(()=>c.page("page/tasks"))),s.cmdReg(i+".logout-es",(()=>c.page("page/logout"))),s.cmdReg(i+".home-es",(()=>c.page("page/dash"))),s.cmdReg(i+".tasks-es",(()=>c.page("page/tasks")))),a.default.register(s),o.Services.register(s)},e.deactivate=function(){o.Services.dispose()}})(),module.exports=i})();
//# sourceMappingURL=extension.js.map