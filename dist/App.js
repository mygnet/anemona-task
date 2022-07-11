var app = (function () {
    'use strict';

    function noop() { }
    function assign$2(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign$2($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = typeof node[prop] === 'boolean' && value === '' ? true : value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* webviews\App\components\Spinner.svelte generated by Svelte v3.48.0 */

    const file$l = "webviews\\App\\components\\Spinner.svelte";

    function create_fragment$m(ctx) {
    	let svg;
    	let circle;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "path svelte-19mhnlm");
    			attr_dev(circle, "cx", "25");
    			attr_dev(circle, "cy", "25");
    			attr_dev(circle, "r", "20");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke-width", /*thickness*/ ctx[1]);
    			add_location(circle, file$l, 13, 4, 218);
    			attr_dev(svg, "class", "spinner svelte-19mhnlm");
    			attr_dev(svg, "viewBox", "0 0 50 50");
    			attr_dev(svg, "width", /*size*/ ctx[0]);
    			attr_dev(svg, "height", /*size*/ ctx[0]);
    			set_style(svg, "--speed", /*speed*/ ctx[2] + "ms");
    			add_location(svg, file$l, 6, 0, 90);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, circle);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$m.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$m($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Spinner', slots, []);
    	let size = 50, thickness = 3, speed = 2000;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Spinner> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ size, thickness, speed });

    	$$self.$inject_state = $$props => {
    		if ('size' in $$props) $$invalidate(0, size = $$props.size);
    		if ('thickness' in $$props) $$invalidate(1, thickness = $$props.thickness);
    		if ('speed' in $$props) $$invalidate(2, speed = $$props.speed);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [size, thickness, speed];
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$m, create_fragment$m, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Spinner",
    			options,
    			id: create_fragment$m.name
    		});
    	}
    }

    const vscode = acquireVsCodeApi();

    /* eslint-disable curly */
    /**
     * Clase para manejar el estado de los datos
     * de forma persistente en visual studio code
     */
    class State {
        static addEventListener(funcPage) {
            State.funcEvent = funcPage;
        }
        static run(cmd) {
            State.funcEvent(cmd, 'exec');
        }
        static drop() {
            State.rd = {};
            vscode.setState(State.rd);
        }
        static get(id, val = null) {
            //console.log('STATE::', id, State.rd);
            if (State.rd[id])
                return State.rd[id];
            //console.log('STATE undefined::', id);
            State.rd = vscode.getState() || {};
            if (State.rd[id])
                return State.rd[id];
            if (val !== null) {
                State.set(id, val);
                return val;
            }
            return null;
        }
        static set(id, data) {
            State.rd[id] = data;
            vscode.setState(State.rd);
        }
        static dispatch(el, fun) {
            //console.log('dispatch interactive...');
            if (el)
                return fun(true);
            window.setTimeout(() => {
                if (typeof fun === 'function')
                    fun((ex) => {
                        State.dispatch(ex, fun);
                    });
            }, 100);
        }
    }
    State.rd = {};
    /**
     * Método para manejar los eventos del listener de estado
     * @param cmd comando
     * @param type
     */
    State.funcEvent = (cmd, type) => { };

    class Command {
        static call(rq) {
            if (rq && rq.cmd) {
                if (typeof Command.db[rq.cmd] === 'function') {
                    Command.db[rq.cmd](rq.dat || null);
                    Command.db[rq.cmd] = undefined;
                    return true;
                }
            }
            return false;
        }
        static send(command, data = null, func = null) {
            if (typeof data === 'function') {
                func = data;
                data = {};
            }
            const content = data || {};
            if (typeof func === 'function') {
                Command.db[command] = func;
            }
            return vscode.postMessage({ command: command, content: content });
        }
    }
    Command.db = {};

    var connect$1="Conectar";var pending$1="Pendientes";var solved$1="Resueltas";var loading$1="Cargando";var search$1="Buscar";var all$1="Todas";var open$1="Abiertas";var close$1="Cerradas";var assigned$1="Asignadas";var delegates$1="Delegadas";var back$1="Regresar";var title$1="Título";var description$1="Descripción";var deadline$1="Fecha de entrega";var add$1="Agregar";var save$1="Guardar";var cancel$1="Cancelar";var remove$1="Eliminar";var disconnect$1="Desconectar";var err$1="An error occurred, please try again later";var project$1="Proyecto";var logs$1="Bitácora";var priority$1="Prioridad";var author$1="Author";var assign$1="Asignado";var comments$1="Comentarios";var comment$1="Comentario";var closed$1="Cerrado";var opened$1="Abierto";var alternatives$1="Alternativas";var langEs = {"personal-access-tokens":"Token de Acceso Personal","gitlab-host":"Servidor control de versiones GitLab","log-in":"Iniciar session","show-token":"Ver token","api-services":"Api para acciones de administrador (opcional)",connect:connect$1,"select-project":"Selecciona un proyecto",pending:pending$1,solved:solved$1,"high-priority":"Prioridad Alta","medium-priority":"Prioridad Media","low-priority":"Prioridad Baja",loading:loading$1,"select-option":"Selecciona un opción",search:search$1,all:all$1,open:open$1,close:close$1,assigned:assigned$1,delegates:delegates$1,"new-task":"Agregar una nueva tarea",back:back$1,"assign-user":"Asignar un usuario","edit-task":"Editar tarea (Incidencia)",title:title$1,description:description$1,"select-priority":"Selecciona una opción",deadline:deadline$1,add:add$1,save:save$1,"delete-task":"Eliminar tarea (incidencia)","are-you-sure-you-want-to-delete":"¿Está seguro de que desea eliminar esta tarea (incidencia)?",cancel:cancel$1,remove:remove$1,"are-you-sure-you-want-to-log-out":"¿Estás seguro de que quieres cerrar sesión?",disconnect:disconnect$1,"403forbidden":"403 Prohibido",err:err$1,"no-tasks-assigned":"No hay tareas asignadas para este proyecto","no-tasks-delegated":"No hay tareas delegadas para este proyecto","progress-percentage":"Porcentaje de avances",project:project$1,logs:logs$1,priority:priority$1,author:author$1,assign:assign$1,comments:comments$1,"created-at":"Creado el",comment:comment$1,"new-comment":"Nuevo comentario",closed:closed$1,opened:opened$1,"updated-at":"Actualizado el","closed-at":"Cerrado el","unknown-problem-occurred":"Ocurrió un problema desconocido",alternatives:alternatives$1,"please-refresh":"Presiona el icono de Recargar que esta en barra superior  de la extensión","close-and-open":"Cerrar y abrir la pestaña o vista","sign-out-and-sign":"Cerrar e Iniciar sesión"};

    var connect="Connect";var pending="Pending tasks";var solved="Solved tasks";var loading="Loading";var search="Search";var all="All";var open="Open";var close="Closed";var assigned="Assigned";var delegates="Delegates";var back="Go back";var title="Title";var description="Description";var deadline="Deadline";var add="Add";var save="Save";var cancel="Cancel";var remove="Remove";var disconnect="Disconnect";var err="An error occurred, please try again later";var project="Project";var logs="logs";var priority="Priority";var author="Author";var assign="Assigned";var comments="Comments";var comment="Comment";var closed="closed";var opened="open";var alternatives="Alternatives";var langEn = {"personal-access-tokens":"Personal Access Tokens","gitlab-host":"GitLab version control server","log-in":"Log in","show-token":"Show Token","api-services":"API for admin actions (optional)",connect:connect,"select-project":"Select a project",pending:pending,solved:solved,"high-priority":"High priority","medium-priority":"Medium priority","low-priority":"Low priority",loading:loading,"select-option":"Select an option",search:search,all:all,open:open,close:close,assigned:assigned,delegates:delegates,"new-task":"New task (Issue)",back:back,"assign-user":"Assign to user","edit-task":"Edit Task (Issue)",title:title,description:description,"select-priority":"Select a priority",deadline:deadline,add:add,save:save,"delete-task":"Delete Task (Issue)","are-you-sure-you-want-to-delete":"Are you sure you want to delete this task (issue)?",cancel:cancel,remove:remove,"are-you-sure-you-want-to-log-out":"Are you sure you want to log out?",disconnect:disconnect,"403forbidden":"403 Forbidden",err:err,"no-tasks-assigned":"There are no assigned tasks for this project","no-tasks-delegated":"There are no delegated tasks for this project","progress-percentage":"Progress percentage",project:project,logs:logs,priority:priority,author:author,assign:assign,comments:comments,"created-at":"Created at",comment:comment,"new-comment":"New comment",closed:closed,opened:opened,"updated-at":"Updated at","closed-at":"Closed at","unknown-problem-occurred":"An unknown problem occurred",alternatives:alternatives,"please-refresh":"Press the Reload icon that is on the top bar of the extension","close-and-open":"Close and open tabs or views","sign-out-and-sign":"Sign out and sign in again"};

    /* eslint-disable curly */
    class Lang {
        static key(name) {
            const id = name.toLowerCase().replace(/[^a-z0-9-]/g, '');
            return Lang.get(id) || name;
        }
        static load(lang) {
            if (lang === 'es')
                Lang.rd = langEs;
            else if (lang === 'en')
                Lang.rd = langEn;
            Lang.id = lang;
        }
        static get(key) {
            if (!Lang.rd) {
                Lang.rd = Lang.id === 'es' ? langEs : langEn;
            }
            //console.log('data lang', Lang.rd);
            return Lang.rd[key] || '';
        }
    }
    Lang.id = 'en';
    Lang.rd = null;

    /* eslint-disable curly */
    class Page {
        static clean() {
            State.set('page', []);
        }
        static setScroll(id, time = 0) {
            window.setTimeout(() => {
                window.scrollTo(0, State.get('scroll_' + id) || 0);
            }, time);
        }
        static addEventListener(funcPage) {
            Page.funcEvent = funcPage;
        }
        static back() {
            const page = Page.get() || 'dash';
            Page.funcEvent(page, 'back');
        }
        static put(page) {
            Page.funcEvent(page, 'put');
        }
        static set(page) {
            const pp = State.get('page') || [];
            if (!pp.length || pp[pp.length - 1] !== page) {
                pp.push(page);
                if (pp.length > 9)
                    pp.shift();
                State.set('page', pp);
            }
        }
        static get() {
            let pp = State.get('page');
            pp = pp instanceof Array ? pp : [];
            let page = null;
            if (pp.pop())
                page = pp.pop();
            State.set('page', pp);
            return page;
        }
        static last() {
            let pp = State.get('page') || [];
            let page = pp.pop();
            State.set('page', pp);
            return page;
        }
    }
    Page.funcEvent = (page, type) => { };

    /* eslint-disable curly */
    let rd = {};
    class Session {
        static set(data) {
            rd = data;
            State.set('user', rd);
        }
        static get() {
            Session.load();
            return rd;
        }
        static allow() {
            return rd && rd.id ? rd.allow : false;
        }
        static load() {
            rd = rd && rd.id ? rd : State.get('user') || {};
        }
        static getApiService(host) {
            if (host.indexOf('aidev.work') !== -1) {
                return host.replace('git.', '').replace(':8082', '') + '/api-task/v1';
            }
            return '';
        }
        static wAuth() {
            return Command.send("session/init", rd, (rs) => {
                //Lang.load(rs && rs.lang ? rs.lang : "en");
                //Page.put(Page.last() || "dash");
                //State.run('refresh');
            });
        }
        static auth(type) {
            Session.isView = type !== 'sidebar';
            Session.type = type;
            Session.load();
            //console.log('session:', rd);
            if (this.isView || (rd.id && rd.host && rd.token)) {
                //console.log('rs', 'session auth', rd);
                return Command.send("session/init", rd, (rs) => {
                    //console.log('session init rs', rs);
                    Lang.load(rs && rs.lang ? rs.lang : "en");
                    if (Session.isView) {
                        if (rs.id) {
                            Session.set(rs);
                            Page.put(Session.type);
                        }
                        else
                            Page.put('closed');
                    }
                    else {
                        Page.put(Page.last() || "dash");
                        State.run('refresh');
                    }
                });
            }
            return Command.send("session/drop", () => {
                Page.put("login");
            });
        }
        static login(rd, callback) {
            //console.log('login: ', rd);
            rd.service = Session.getApiService(rd.host);
            Command.send("session/login", rd, (user) => {
                if (user && user.id) {
                    State.set("user", user);
                    State.set("page", []);
                    Page.put("dash");
                    Command.send("reloads");
                    callback(true);
                }
                callback(false);
            });
        }
        static drop() {
            rd = {};
            State.set('user', rd);
            Command.send("session/drop", () => {
                Page.put("login");
            });
        }
    }
    Session.isView = false;
    Session.type = 'sidebar';

    /* webviews\App\Login.svelte generated by Svelte v3.48.0 */
    const file$k = "webviews\\App\\Login.svelte";

    // (58:2) {:else}
    function create_else_block$8(ctx) {
    	let button;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = `${Lang.get("connect")}`;
    			attr_dev(button, "type", "submit");
    			add_location(button, file$k, 58, 2, 1532);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$8.name,
    		type: "else",
    		source: "(58:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:2) {#if loading}
    function create_if_block$c(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$c.name,
    		type: "if",
    		source: "(56:2) {#if loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$l(ctx) {
    	let h3;
    	let t1;
    	let form;
    	let div0;
    	let label0;
    	let t3;
    	let input0;
    	let t4;
    	let div1;
    	let label1;
    	let t6;
    	let input1;
    	let t7;
    	let div2;
    	let input2;
    	let t8;
    	let label2;
    	let t10;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block$c, create_else_block$8];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = `${Lang.get("log-in")}`;
    			t1 = space();
    			form = element("form");
    			div0 = element("div");
    			label0 = element("label");
    			label0.textContent = `${Lang.get("gitlab-host")}`;
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			div1 = element("div");
    			label1 = element("label");
    			label1.textContent = `${Lang.get("personal-access-tokens")}`;
    			t6 = space();
    			input1 = element("input");
    			t7 = space();
    			div2 = element("div");
    			input2 = element("input");
    			t8 = space();
    			label2 = element("label");
    			label2.textContent = `${Lang.get("show-token")}`;
    			t10 = space();
    			if_block.c();
    			attr_dev(h3, "class", "pb1");
    			add_location(h3, file$k, 36, 0, 871);
    			attr_dev(label0, "for", "apiHost");
    			add_location(label0, file$k, 39, 4, 971);
    			attr_dev(input0, "type", "url");
    			input0.required = true;
    			add_location(input0, file$k, 40, 4, 1031);
    			add_location(div0, file$k, 38, 2, 960);
    			attr_dev(label1, "for", "privateToken");
    			add_location(label1, file$k, 43, 4, 1127);
    			attr_dev(input1, "type", "password");
    			input1.required = true;
    			add_location(input1, file$k, 44, 4, 1203);
    			add_location(div1, file$k, 42, 2, 1116);
    			attr_dev(input2, "type", "checkbox");
    			attr_dev(input2, "id", "showprivateToken");
    			add_location(input2, file$k, 52, 4, 1339);
    			attr_dev(label2, "for", "showprivateToken");
    			add_location(label2, file$k, 53, 4, 1413);
    			add_location(div2, file$k, 51, 2, 1328);
    			add_location(form, file$k, 37, 0, 914);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, label0);
    			append_dev(div0, t3);
    			append_dev(div0, input0);
    			/*input0_binding*/ ctx[5](input0);
    			set_input_value(input0, /*rd*/ ctx[1].host);
    			append_dev(form, t4);
    			append_dev(form, div1);
    			append_dev(div1, label1);
    			append_dev(div1, t6);
    			append_dev(div1, input1);
    			/*input1_binding*/ ctx[7](input1);
    			set_input_value(input1, /*rd*/ ctx[1].token);
    			append_dev(form, t7);
    			append_dev(form, div2);
    			append_dev(div2, input2);
    			append_dev(div2, t8);
    			append_dev(div2, label2);
    			append_dev(form, t10);
    			if_blocks[current_block_type_index].m(form, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[8]),
    					listen_dev(input2, "change", /*onChange*/ ctx[4], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*onSubmit*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*rd*/ 2) {
    				set_input_value(input0, /*rd*/ ctx[1].host);
    			}

    			if (dirty & /*rd*/ 2 && input1.value !== /*rd*/ ctx[1].token) {
    				set_input_value(input1, /*rd*/ ctx[1].token);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(form, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(form);
    			/*input0_binding*/ ctx[5](null);
    			/*input1_binding*/ ctx[7](null);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$l.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$l($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Login', slots, []);
    	let loading = false;
    	const rd = { host: "", token: "" };

    	// const rd = {
    	//   host: "http://git.aidev.work:8082",
    	//   token: "QZPhNvxBrk-Ufvr1Pbjn",
    	// };
    	//const rd = {
    	//  host: "https://gitlab.com",
    	//  token: "glpat-2CaxxM3K-yie97GyKUxx",
    	//};
    	const inp = { host: null, token: null };

    	const onSubmit = () => {
    		$$invalidate(0, loading = true);
    		Session.login(rd, success => $$invalidate(0, loading = !success));
    	};

    	const onChange = evt => {
    		inp.token.setAttribute("type", evt.target.checked ? "text" : "password");
    	};

    	onMount(() => {
    		State.drop();
    		inp.host.focus();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inp.host = $$value;
    			$$invalidate(2, inp);
    		});
    	}

    	function input0_input_handler() {
    		rd.host = this.value;
    		$$invalidate(1, rd);
    	}

    	function input1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inp.token = $$value;
    			$$invalidate(2, inp);
    		});
    	}

    	function input1_input_handler() {
    		rd.token = this.value;
    		$$invalidate(1, rd);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Spinner,
    		Session,
    		Lang,
    		State,
    		loading,
    		rd,
    		inp,
    		onSubmit,
    		onChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('loading' in $$props) $$invalidate(0, loading = $$props.loading);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loading,
    		rd,
    		inp,
    		onSubmit,
    		onChange,
    		input0_binding,
    		input0_input_handler,
    		input1_binding,
    		input1_input_handler
    	];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$l, create_fragment$l, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$l.name
    		});
    	}
    }

    /* webviews\App\Logout.svelte generated by Svelte v3.48.0 */
    const file$j = "webviews\\App\\Logout.svelte";

    function create_fragment$k(ctx) {
    	let div4;
    	let h3;
    	let t1;
    	let div2;
    	let div0;
    	let input;
    	let t2;
    	let div1;
    	let button;
    	let t4;
    	let div3;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h3 = element("h3");
    			h3.textContent = `${Lang.get("are-you-sure-you-want-to-log-out")}`;
    			t1 = space();
    			div2 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t2 = space();
    			div1 = element("div");
    			button = element("button");
    			button.textContent = `${Lang.get("disconnect")}`;
    			t4 = space();
    			div3 = element("div");
    			attr_dev(h3, "class", "p2");
    			add_location(h3, file$j, 15, 2, 371);
    			attr_dev(input, "type", "button");
    			attr_dev(input, "class", "btn svelte-m2va21");
    			input.value = Lang.get("cancel");
    			add_location(input, file$j, 19, 6, 510);
    			attr_dev(div0, "class", "col col-6 center");
    			add_location(div0, file$j, 18, 4, 472);
    			attr_dev(button, "type", "button");
    			attr_dev(button, "class", "svelte-m2va21");
    			add_location(button, file$j, 27, 6, 695);
    			attr_dev(div1, "class", "col col-6 center");
    			add_location(div1, file$j, 26, 4, 657);
    			attr_dev(div2, "class", "clearfix");
    			add_location(div2, file$j, 17, 2, 444);
    			add_location(div3, file$j, 32, 2, 823);
    			attr_dev(div4, "class", "box-content svelte-m2va21");
    			add_location(div4, file$j, 14, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h3);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			append_dev(div2, div0);
    			append_dev(div0, input);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, button);
    			append_dev(div4, t4);
    			append_dev(div4, div3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "click", /*handleCancel*/ ctx[0], false, false, false),
    					listen_dev(button, "click", /*handleExitSession*/ ctx[1], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$k.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$k($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Logout', slots, []);
    	const handleCancel = () => Page.back();

    	const handleExitSession = () => {
    		Command.send("web-task/closed");
    		Session.drop();
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Logout> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Command,
    		Lang,
    		Page,
    		Session,
    		handleCancel,
    		handleExitSession
    	});

    	return [handleCancel, handleExitSession];
    }

    class Logout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$k, create_fragment$k, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Logout",
    			options,
    			id: create_fragment$k.name
    		});
    	}
    }

    /* webviews\App\components\LabelEdit.svelte generated by Svelte v3.48.0 */

    const file$i = "webviews\\App\\components\\LabelEdit.svelte";

    // (53:4) {:else}
    function create_else_block$7(ctx) {
    	let span;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*text*/ ctx[0]);
    			attr_dev(span, "class", "svelte-1oody2j");
    			add_location(span, file$i, 53, 8, 1373);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*onEdit*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*text*/ 1) set_data_dev(t, /*text*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$7.name,
    		type: "else",
    		source: "(53:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (36:4) {#if edit === true}
    function create_if_block$b(ctx) {
    	let div;
    	let input;
    	let t0;
    	let button0;
    	let i0;
    	let t1;
    	let button1;
    	let i1;
    	let i1_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			button0 = element("button");
    			i0 = element("i");
    			t1 = space();
    			button1 = element("button");
    			i1 = element("i");
    			input.disabled = /*disabled*/ ctx[3];
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-1oody2j");
    			add_location(input, file$i, 37, 12, 875);
    			attr_dev(i0, "class", "fas fa-xmark");
    			add_location(i0, file$i, 46, 16, 1160);
    			button0.disabled = /*disabled*/ ctx[3];
    			attr_dev(button0, "class", "btn-cancel svelte-1oody2j");
    			attr_dev(button0, "type", "button");
    			add_location(button0, file$i, 38, 12, 939);
    			attr_dev(i1, "class", i1_class_value = "" + (null_to_empty(/*css*/ ctx[2]) + " svelte-1oody2j"));
    			add_location(i1, file$i, 49, 16, 1294);
    			button1.disabled = /*disabled*/ ctx[3];
    			attr_dev(button1, "type", "button");
    			attr_dev(button1, "class", "svelte-1oody2j");
    			add_location(button1, file$i, 48, 12, 1223);
    			attr_dev(div, "class", "item-group svelte-1oody2j");
    			add_location(div, file$i, 36, 8, 837);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*text*/ ctx[0]);
    			append_dev(div, t0);
    			append_dev(div, button0);
    			append_dev(button0, i0);
    			append_dev(div, t1);
    			append_dev(div, button1);
    			append_dev(button1, i1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[8]),
    					listen_dev(button0, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*onSubmit*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*disabled*/ 8) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*text*/ 1 && input.value !== /*text*/ ctx[0]) {
    				set_input_value(input, /*text*/ ctx[0]);
    			}

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(button0, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*css*/ 4 && i1_class_value !== (i1_class_value = "" + (null_to_empty(/*css*/ ctx[2]) + " svelte-1oody2j"))) {
    				attr_dev(i1, "class", i1_class_value);
    			}

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(button1, "disabled", /*disabled*/ ctx[3]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$b.name,
    		type: "if",
    		source: "(36:4) {#if edit === true}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$j(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*edit*/ ctx[1] === true) return create_if_block$b;
    		return create_else_block$7;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$i, 34, 0, 797);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$j.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$j($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LabelEdit', slots, []);
    	let { id = "" } = $$props;
    	let { text = "" } = $$props;

    	let { onSave = text => {
    		
    	} } = $$props;

    	let _text = text;
    	let edit = false;
    	let newText = "";
    	let css = "fas fa-edit";
    	let disabled = false;

    	function onEdit() {
    		$$invalidate(1, edit = edit ? false : true);
    	}

    	function onSubmit() {
    		$$invalidate(3, disabled = true);
    		$$invalidate(2, css = "fas fa-spinner fa-spin");

    		onSave(id, text, value => {
    			$$invalidate(3, disabled = false);
    			$$invalidate(2, css = "fas fa-edit");

    			if (value !== undefined) {
    				_text = value;
    				$$invalidate(0, text = value);
    			} else $$invalidate(0, text = _text);

    			onEdit();
    		});
    	}

    	const writable_props = ['id', 'text', 'onSave'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LabelEdit> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		text = this.value;
    		$$invalidate(0, text);
    	}

    	const click_handler = () => {
    		onEdit();
    	};

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(6, id = $$props.id);
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('onSave' in $$props) $$invalidate(7, onSave = $$props.onSave);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		text,
    		onSave,
    		_text,
    		edit,
    		newText,
    		css,
    		disabled,
    		onEdit,
    		onSubmit
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(6, id = $$props.id);
    		if ('text' in $$props) $$invalidate(0, text = $$props.text);
    		if ('onSave' in $$props) $$invalidate(7, onSave = $$props.onSave);
    		if ('_text' in $$props) _text = $$props._text;
    		if ('edit' in $$props) $$invalidate(1, edit = $$props.edit);
    		if ('newText' in $$props) newText = $$props.newText;
    		if ('css' in $$props) $$invalidate(2, css = $$props.css);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		text,
    		edit,
    		css,
    		disabled,
    		onEdit,
    		onSubmit,
    		id,
    		onSave,
    		input_input_handler,
    		click_handler
    	];
    }

    class LabelEdit extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$j, create_fragment$j, safe_not_equal, { id: 6, text: 0, onSave: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LabelEdit",
    			options,
    			id: create_fragment$j.name
    		});
    	}

    	get id() {
    		throw new Error("<LabelEdit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<LabelEdit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get text() {
    		throw new Error("<LabelEdit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set text(value) {
    		throw new Error("<LabelEdit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSave() {
    		throw new Error("<LabelEdit>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSave(value) {
    		throw new Error("<LabelEdit>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\components\Card.svelte generated by Svelte v3.48.0 */

    const file$h = "webviews\\App\\components\\Card.svelte";
    const get_content_slot_changes = dirty => ({});
    const get_content_slot_context = ctx => ({});

    function create_fragment$i(ctx) {
    	let div;
    	let current;
    	const content_slot_template = /*#slots*/ ctx[1].content;
    	const content_slot = create_slot(content_slot_template, ctx, /*$$scope*/ ctx[0], get_content_slot_context);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (content_slot) content_slot.c();
    			attr_dev(div, "class", "card mb1 svelte-7xrf3f");
    			add_location(div, file$h, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (content_slot) {
    				content_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (content_slot) {
    				if (content_slot.p && (!current || dirty & /*$$scope*/ 1)) {
    					update_slot_base(
    						content_slot,
    						content_slot_template,
    						ctx,
    						/*$$scope*/ ctx[0],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[0])
    						: get_slot_changes(content_slot_template, /*$$scope*/ ctx[0], dirty, get_content_slot_changes),
    						get_content_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(content_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(content_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (content_slot) content_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$i.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$i($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Card', slots, ['content']);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Card> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, slots];
    }

    class Card extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$i, create_fragment$i, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Card",
    			options,
    			id: create_fragment$i.name
    		});
    	}
    }

    /* webviews\App\Dash\Profile.svelte generated by Svelte v3.48.0 */
    const file$g = "webviews\\App\\Dash\\Profile.svelte";

    // (52:12) {:else}
    function create_else_block$6(ctx) {
    	let div;
    	let t_value = /*user*/ ctx[0].name + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$g, 52, 16, 1678);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*user*/ 1 && t_value !== (t_value = /*user*/ ctx[0].name + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$6.name,
    		type: "else",
    		source: "(52:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (50:12) {#if user.allow}
    function create_if_block_1$4(ctx) {
    	let labeledit;
    	let current;

    	labeledit = new LabelEdit({
    			props: {
    				id: "name",
    				text: /*user*/ ctx[0].name,
    				onSave: /*onSave*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(labeledit.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(labeledit, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const labeledit_changes = {};
    			if (dirty & /*user*/ 1) labeledit_changes.text = /*user*/ ctx[0].name;
    			labeledit.$set(labeledit_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(labeledit.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(labeledit.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(labeledit, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$4.name,
    		type: "if",
    		source: "(50:12) {#if user.allow}",
    		ctx
    	});

    	return block;
    }

    // (57:8) {#if user.isAdmin}
    function create_if_block$a(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "admin";
    			attr_dev(span, "class", "svelte-1itdom8");
    			add_location(span, file$g, 57, 12, 1802);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$a.name,
    		type: "if",
    		source: "(57:8) {#if user.isAdmin}",
    		ctx
    	});

    	return block;
    }

    // (37:4) 
    function create_content_slot$1(ctx) {
    	let div3;
    	let div0;
    	let li;
    	let t0;
    	let div1;
    	let t2;
    	let div2;
    	let img;
    	let img_src_value;
    	let t3;
    	let h2;
    	let t4_value = /*user*/ ctx[0].username + "";
    	let t4;
    	let t5;
    	let p;
    	let current_block_type_index;
    	let if_block0;
    	let t6;
    	let t7_value = /*user*/ ctx[0].email + "";
    	let t7;
    	let t8;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1$4, create_else_block$6];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[0].allow) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	let if_block1 = /*user*/ ctx[0].isAdmin && create_if_block$a(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div0 = element("div");
    			li = element("li");
    			t0 = space();
    			div1 = element("div");
    			div1.textContent = "12";
    			t2 = space();
    			div2 = element("div");
    			img = element("img");
    			t3 = space();
    			h2 = element("h2");
    			t4 = text(t4_value);
    			t5 = space();
    			p = element("p");
    			if_block0.c();
    			t6 = space();
    			t7 = text(t7_value);
    			t8 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(li, "class", "fa fa-cog");
    			add_location(li, file$g, 37, 29, 1207);
    			attr_dev(div0, "class", "options svelte-1itdom8");
    			add_location(div0, file$g, 37, 8, 1186);
    			attr_dev(div1, "class", "notify svelte-1itdom8");
    			add_location(div1, file$g, 38, 8, 1250);
    			if (!src_url_equal(img.src, img_src_value = /*user*/ ctx[0].avatarUrl)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "profile svelte-1itdom8");
    			add_location(img, file$g, 40, 12, 1327);
    			attr_dev(div2, "class", "cover-photo svelte-1itdom8");
    			add_location(div2, file$g, 39, 8, 1288);
    			attr_dev(h2, "class", "svelte-1itdom8");
    			add_location(h2, file$g, 47, 8, 1505);
    			attr_dev(p, "class", "svelte-1itdom8");
    			add_location(p, file$g, 48, 8, 1539);
    			attr_dev(div3, "slot", "content");
    			add_location(div3, file$g, 36, 4, 1156);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div0);
    			append_dev(div0, li);
    			append_dev(div3, t0);
    			append_dev(div3, div1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div3, t3);
    			append_dev(div3, h2);
    			append_dev(h2, t4);
    			append_dev(div3, t5);
    			append_dev(div3, p);
    			if_blocks[current_block_type_index].m(p, null);
    			append_dev(p, t6);
    			append_dev(p, t7);
    			append_dev(div3, t8);
    			if (if_block1) if_block1.m(div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*onAvatar*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty & /*user*/ 1 && !src_url_equal(img.src, img_src_value = /*user*/ ctx[0].avatarUrl)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*user*/ 1) && t4_value !== (t4_value = /*user*/ ctx[0].username + "")) set_data_dev(t4, t4_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block0 = if_blocks[current_block_type_index];

    				if (!if_block0) {
    					if_block0 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block0.c();
    				} else {
    					if_block0.p(ctx, dirty);
    				}

    				transition_in(if_block0, 1);
    				if_block0.m(p, t6);
    			}

    			if ((!current || dirty & /*user*/ 1) && t7_value !== (t7_value = /*user*/ ctx[0].email + "")) set_data_dev(t7, t7_value);

    			if (/*user*/ ctx[0].isAdmin) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block$a(ctx);
    					if_block1.c();
    					if_block1.m(div3, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if_blocks[current_block_type_index].d();
    			if (if_block1) if_block1.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot$1.name,
    		type: "slot",
    		source: "(37:4) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let card;
    	let current;

    	card = new Card({
    			props: {
    				$$slots: { content: [create_content_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(card, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const card_changes = {};

    			if (dirty & /*$$scope, user*/ 9) {
    				card_changes.$$scope = { dirty, ctx };
    			}

    			card.$set(card_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Profile', slots, []);
    	let { user = {} } = $$props;

    	const onSave = (id, text, done) => {
    		$$invalidate(0, user.name = text, user);
    		const data = {};
    		data[id] = text;

    		//console.log("user Edit", data);
    		Command.send("user/edit", { user: data }, dd => {
    			//console.log("user result: ", dd);
    			if (dd && dd.id) {
    				$$invalidate(0, user = dd);
    				Session.set(user);
    			}

    			if (typeof done === "function") done(dd && dd.name ? dd.name : undefined);
    		});
    	};

    	const onAvatar = () => {
    		if (!user.allow) return;

    		Command.send("user/avatar", dd => {
    			//console.log("user change avatar", dd);
    			if (dd.avatarUrl) {
    				$$invalidate(0, user = dd);
    				Session.set(user);
    				$$invalidate(0, user.avatarUrl = dd.avatarUrl + "?" + Math.random(), user);
    			}
    		});
    	};

    	const writable_props = ['user'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    	};

    	$$self.$capture_state = () => ({
    		LabelEdit,
    		Card,
    		Command,
    		Session,
    		user,
    		onSave,
    		onAvatar
    	});

    	$$self.$inject_state = $$props => {
    		if ('user' in $$props) $$invalidate(0, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [user, onSave, onAvatar];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$h.name
    		});
    	}

    	get user() {
    		throw new Error("<Profile>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set user(value) {
    		throw new Error("<Profile>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\components\ButtonSelect.svelte generated by Svelte v3.48.0 */
    const file$f = "webviews\\App\\components\\ButtonSelect.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[20] = list[i];
    	return child_ctx;
    }

    // (95:4) {:else}
    function create_else_block$5(ctx) {
    	let button;
    	let t;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(/*label*/ ctx[0]);
    			attr_dev(button, "class", "mb1");
    			add_location(button, file$f, 95, 8, 2882);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*onEdit*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) set_data_dev(t, /*label*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$5.name,
    		type: "else",
    		source: "(95:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (56:4) {#if edit === true}
    function create_if_block$9(ctx) {
    	let div2;
    	let div0;
    	let h3;
    	let t0;
    	let t1;
    	let div1;
    	let button0;
    	let i0;
    	let t2;
    	let div3;
    	let input;
    	let t3;
    	let button1;
    	let i1;
    	let t4;
    	let button2;
    	let i2;
    	let i2_class_value;
    	let t5;
    	let div4;
    	let select_1;
    	let mounted;
    	let dispose;
    	let each_value = /*options*/ ctx[5];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h3 = element("h3");
    			t0 = text(/*label*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			i0 = element("i");
    			t2 = space();
    			div3 = element("div");
    			input = element("input");
    			t3 = space();
    			button1 = element("button");
    			i1 = element("i");
    			t4 = space();
    			button2 = element("button");
    			i2 = element("i");
    			t5 = space();
    			div4 = element("div");
    			select_1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(h3, "class", "svelte-148pc8g");
    			add_location(h3, file$f, 57, 30, 1652);
    			attr_dev(div0, "class", "left");
    			add_location(div0, file$f, 57, 12, 1634);
    			attr_dev(i0, "class", "fas fa-xmark");
    			add_location(i0, file$f, 64, 20, 1897);
    			button0.disabled = /*disabled*/ ctx[3];
    			attr_dev(button0, "class", "btn btn-cancel svelte-148pc8g");
    			add_location(button0, file$f, 59, 16, 1725);
    			attr_dev(div1, "class", "right");
    			add_location(div1, file$f, 58, 12, 1688);
    			attr_dev(div2, "class", "clearfix mb1");
    			add_location(div2, file$f, 56, 8, 1594);
    			input.disabled = /*disabled*/ ctx[3];
    			attr_dev(input, "placeholder", "" + (Lang.get('search') + "..."));
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-148pc8g");
    			add_location(input, file$f, 70, 12, 2036);
    			attr_dev(i1, "class", "fas fa-eraser");
    			add_location(i1, file$f, 76, 16, 2285);
    			button1.disabled = /*disabled*/ ctx[3];
    			attr_dev(button1, "class", "btn btn-clean svelte-148pc8g");
    			add_location(button1, file$f, 71, 12, 2131);
    			attr_dev(i2, "class", i2_class_value = "" + (null_to_empty(/*css*/ ctx[4]) + " svelte-148pc8g"));
    			add_location(i2, file$f, 79, 16, 2429);
    			attr_dev(button2, "class", "btn btn-search svelte-148pc8g");
    			button2.disabled = /*disabled*/ ctx[3];
    			add_location(button2, file$f, 78, 12, 2349);
    			attr_dev(div3, "class", "item-group svelte-148pc8g");
    			add_location(div3, file$f, 69, 8, 1998);
    			attr_dev(select_1, "class", "select svelte-148pc8g");
    			if (/*sel*/ ctx[6].id === void 0) add_render_callback(() => /*select_1_change_handler*/ ctx[16].call(select_1));
    			add_location(select_1, file$f, 83, 12, 2526);
    			attr_dev(div4, "class", "mt1");
    			add_location(div4, file$f, 82, 8, 2495);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h3);
    			append_dev(h3, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, button0);
    			append_dev(button0, i0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, input);
    			set_input_value(input, /*value*/ ctx[2]);
    			append_dev(div3, t3);
    			append_dev(div3, button1);
    			append_dev(button1, i1);
    			append_dev(div3, t4);
    			append_dev(div3, button2);
    			append_dev(button2, i2);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, select_1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select_1, null);
    			}

    			/*select_1_binding*/ ctx[15](select_1);
    			select_option(select_1, /*sel*/ ctx[6].id);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[12], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[13]),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[14], false, false, false),
    					listen_dev(button2, "click", /*onSubmit*/ ctx[9], false, false, false),
    					listen_dev(select_1, "change", /*select_1_change_handler*/ ctx[16]),
    					listen_dev(select_1, "change", /*onSelected*/ ctx[10], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 1) set_data_dev(t0, /*label*/ ctx[0]);

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(button0, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(input, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*value*/ 4 && input.value !== /*value*/ ctx[2]) {
    				set_input_value(input, /*value*/ ctx[2]);
    			}

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(button1, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*css*/ 16 && i2_class_value !== (i2_class_value = "" + (null_to_empty(/*css*/ ctx[4]) + " svelte-148pc8g"))) {
    				attr_dev(i2, "class", i2_class_value);
    			}

    			if (dirty & /*disabled*/ 8) {
    				prop_dev(button2, "disabled", /*disabled*/ ctx[3]);
    			}

    			if (dirty & /*options*/ 32) {
    				each_value = /*options*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select_1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*sel, options*/ 96) {
    				select_option(select_1, /*sel*/ ctx[6].id);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			/*select_1_binding*/ ctx[15](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$9.name,
    		type: "if",
    		source: "(56:4) {#if edit === true}",
    		ctx
    	});

    	return block;
    }

    // (90:16) {#each options as op}
    function create_each_block$5(ctx) {
    	let option;
    	let t_value = /*op*/ ctx[20].value + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*op*/ ctx[20].id;
    			option.value = option.__value;
    			add_location(option, file$f, 90, 20, 2754);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 32 && t_value !== (t_value = /*op*/ ctx[20].value + "")) set_data_dev(t, t_value);

    			if (dirty & /*options*/ 32 && option_value_value !== (option_value_value = /*op*/ ctx[20].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(90:16) {#each options as op}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;

    	function select_block_type(ctx, dirty) {
    		if (/*edit*/ ctx[1] === true) return create_if_block$9;
    		return create_else_block$5;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			add_location(div, file$f, 54, 0, 1554);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ButtonSelect', slots, []);
    	let { id = "" } = $$props;
    	let { label = "" } = $$props;
    	const dispatch = createEventDispatcher();
    	let edit = false;
    	let value = "";
    	let disabled = false;
    	let css = "fas fa-search";
    	let options = [];
    	let sel = { id: 0, name: "" };
    	let select = null;

    	const onExpand = edit => {
    		dispatch("EventExpand", edit);
    	};

    	const onEdit = cancel => {
    		$$invalidate(1, edit = edit ? false : true);
    		onExpand(edit);
    	};

    	const bbs = dis => {
    		$$invalidate(3, disabled = dis);

    		if (dis) {
    			$$invalidate(5, options = [
    				{
    					id: "",
    					value: Lang.get("loading") + "..."
    				}
    			]);

    			$$invalidate(6, sel.id = "", sel);
    		}

    		$$invalidate(4, css = "fas fa-" + (disabled ? "spinner fa-spin" : "search"));
    	};

    	const onSubmit = () => {
    		bbs(true);

    		dispatch("EventSelect", {
    			id,
    			value: value || "",
    			fun: dd => {
    				dd.unshift({
    					id: "",
    					value: Lang.get("select-option") + "..."
    				});

    				$$invalidate(5, options = dd);
    				bbs(false);
    				dispatch("EventSelect", { id, data: { id: 0, name: "" } });
    			}
    		});
    	};

    	const onSelected = () => {
    		$$invalidate(6, sel.name = select.options[select.selectedIndex].text, sel);
    		dispatch("EventSelect", { id, data: sel });
    	};

    	const writable_props = ['id', 'label'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ButtonSelect> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onEdit(1);

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(2, value);
    	}

    	const click_handler_1 = () => $$invalidate(2, value = "");

    	function select_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			select = $$value;
    			$$invalidate(7, select);
    		});
    	}

    	function select_1_change_handler() {
    		sel.id = select_value(this);
    		$$invalidate(6, sel);
    		$$invalidate(5, options);
    	}

    	$$self.$$set = $$props => {
    		if ('id' in $$props) $$invalidate(11, id = $$props.id);
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Lang,
    		id,
    		label,
    		dispatch,
    		edit,
    		value,
    		disabled,
    		css,
    		options,
    		sel,
    		select,
    		onExpand,
    		onEdit,
    		bbs,
    		onSubmit,
    		onSelected
    	});

    	$$self.$inject_state = $$props => {
    		if ('id' in $$props) $$invalidate(11, id = $$props.id);
    		if ('label' in $$props) $$invalidate(0, label = $$props.label);
    		if ('edit' in $$props) $$invalidate(1, edit = $$props.edit);
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('disabled' in $$props) $$invalidate(3, disabled = $$props.disabled);
    		if ('css' in $$props) $$invalidate(4, css = $$props.css);
    		if ('options' in $$props) $$invalidate(5, options = $$props.options);
    		if ('sel' in $$props) $$invalidate(6, sel = $$props.sel);
    		if ('select' in $$props) $$invalidate(7, select = $$props.select);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		label,
    		edit,
    		value,
    		disabled,
    		css,
    		options,
    		sel,
    		select,
    		onEdit,
    		onSubmit,
    		onSelected,
    		id,
    		click_handler,
    		input_input_handler,
    		click_handler_1,
    		select_1_binding,
    		select_1_change_handler
    	];
    }

    class ButtonSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, { id: 11, label: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ButtonSelect",
    			options,
    			id: create_fragment$g.name
    		});
    	}

    	get id() {
    		throw new Error("<ButtonSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<ButtonSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<ButtonSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<ButtonSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\components\Gauge.svelte generated by Svelte v3.48.0 */
    const file$e = "webviews\\App\\components\\Gauge.svelte";

    function create_fragment$f(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let t;
    	let div1;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t = space();
    			div1 = element("div");
    			attr_dev(div0, "class", "gauge__fill svelte-1dhextl");
    			add_location(div0, file$e, 20, 8, 483);
    			attr_dev(div1, "class", "gauge__cover svelte-1dhextl");
    			add_location(div1, file$e, 21, 8, 542);
    			attr_dev(div2, "class", "gauge__body svelte-1dhextl");
    			add_location(div2, file$e, 19, 4, 448);
    			attr_dev(div3, "class", "gauge svelte-1dhextl");
    			add_location(div3, file$e, 18, 0, 423);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			/*div0_binding*/ ctx[3](div0);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			/*div1_binding*/ ctx[4](div1);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			/*div0_binding*/ ctx[3](null);
    			/*div1_binding*/ ctx[4](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Gauge', slots, []);
    	let { value = 0 } = $$props;
    	let gaugeFill = null;
    	let gaugeCover = null;

    	function setGaugeValue(val) {
    		if (val < 0 || val > 1) return;
    		$$invalidate(0, gaugeFill.style.transform = `rotate(${val / 2}turn)`, gaugeFill);
    		$$invalidate(1, gaugeCover.textContent = `${Math.round(val * 100)}%`, gaugeCover);
    	}

    	onMount(() => {
    		setGaugeValue(value);
    	});

    	const writable_props = ['value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Gauge> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			gaugeFill = $$value;
    			$$invalidate(0, gaugeFill);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			gaugeCover = $$value;
    			$$invalidate(1, gaugeCover);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		value,
    		gaugeFill,
    		gaugeCover,
    		setGaugeValue
    	});

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(2, value = $$props.value);
    		if ('gaugeFill' in $$props) $$invalidate(0, gaugeFill = $$props.gaugeFill);
    		if ('gaugeCover' in $$props) $$invalidate(1, gaugeCover = $$props.gaugeCover);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [gaugeFill, gaugeCover, value, div0_binding, div1_binding];
    }

    class Gauge extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { value: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Gauge",
    			options,
    			id: create_fragment$f.name
    		});
    	}

    	get value() {
    		throw new Error("<Gauge>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Gauge>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\components\Progress.svelte generated by Svelte v3.48.0 */

    const file$d = "webviews\\App\\components\\Progress.svelte";

    function create_fragment$e(ctx) {
    	let div2;
    	let div1;
    	let t0;
    	let div0;
    	let t1;
    	let span;
    	let t2;
    	let t3;
    	let div2_class_value;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			t0 = text("Progress\r\n        ");
    			div0 = element("div");
    			t1 = space();
    			span = element("span");
    			t2 = text(/*value*/ ctx[0]);
    			t3 = text("%");
    			attr_dev(div0, "class", "progress-bar--inner svelte-1i3b98l");
    			set_style(div0, "width", /*value*/ ctx[0] + "%");
    			add_location(div0, file$d, 8, 8, 197);
    			attr_dev(div1, "class", "progress-bar svelte-1i3b98l");
    			add_location(div1, file$d, 6, 4, 143);
    			attr_dev(span, "class", "progress-bar--counter svelte-1i3b98l");
    			add_location(span, file$d, 10, 4, 275);
    			attr_dev(div2, "class", div2_class_value = "progress-bar--wrap progress-bar--" + /*color*/ ctx[1] + " svelte-1i3b98l");
    			add_location(div2, file$d, 5, 0, 83);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div2, t1);
    			append_dev(div2, span);
    			append_dev(span, t2);
    			append_dev(span, t3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*value*/ 1) {
    				set_style(div0, "width", /*value*/ ctx[0] + "%");
    			}

    			if (dirty & /*value*/ 1) set_data_dev(t2, /*value*/ ctx[0]);

    			if (dirty & /*color*/ 2 && div2_class_value !== (div2_class_value = "progress-bar--wrap progress-bar--" + /*color*/ ctx[1] + " svelte-1i3b98l")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Progress', slots, []);
    	let { value = 0 } = $$props;
    	let { color = "green" } = $$props;
    	const writable_props = ['value', 'color'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Progress> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    	};

    	$$self.$capture_state = () => ({ value, color });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('color' in $$props) $$invalidate(1, color = $$props.color);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, color];
    }

    class Progress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, { value: 0, color: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Progress",
    			options,
    			id: create_fragment$e.name
    		});
    	}

    	get value() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get color() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\Dash\Statistics.svelte generated by Svelte v3.48.0 */
    const file$c = "webviews\\App\\Dash\\Statistics.svelte";

    // (129:0) {:else}
    function create_else_block$4(ctx) {
    	let card0;
    	let t;
    	let card1;
    	let current;

    	card0 = new Card({
    			props: {
    				$$slots: { content: [create_content_slot_1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	card1 = new Card({
    			props: {
    				$$slots: { content: [create_content_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(card0.$$.fragment);
    			t = space();
    			create_component(card1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(card0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(card1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const card0_changes = {};

    			if (dirty & /*$$scope, st*/ 8193) {
    				card0_changes.$$scope = { dirty, ctx };
    			}

    			card0.$set(card0_changes);
    			const card1_changes = {};

    			if (dirty & /*$$scope, st*/ 8193) {
    				card1_changes.$$scope = { dirty, ctx };
    			}

    			card1.$set(card1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(card0.$$.fragment, local);
    			transition_in(card1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(card0.$$.fragment, local);
    			transition_out(card1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(card0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(card1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(129:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (127:0) {#if loading}
    function create_if_block$8(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$8.name,
    		type: "if",
    		source: "(127:0) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (131:8) 
    function create_content_slot_1(ctx) {
    	let div;
    	let h20;
    	let t0_value = Lang.get("pending") + "";
    	let t0;
    	let t1;
    	let t2_value = /*st*/ ctx[0].opened.num + "";
    	let t2;
    	let t3;
    	let t4;
    	let progress0;
    	let t5;
    	let h21;
    	let t7;
    	let progress1;
    	let current;

    	progress0 = new Progress({
    			props: {
    				value: /*st*/ ctx[0].opened.val,
    				color: "orange"
    			},
    			$$inline: true
    		});

    	progress1 = new Progress({
    			props: {
    				value: /*st*/ ctx[0].progress.val,
    				color: "blue"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h20 = element("h2");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			t4 = space();
    			create_component(progress0.$$.fragment);
    			t5 = space();
    			h21 = element("h2");
    			h21.textContent = `${Lang.get("progress-percentage")}`;
    			t7 = space();
    			create_component(progress1.$$.fragment);
    			attr_dev(h20, "class", "mt2 mb1");
    			add_location(h20, file$c, 131, 12, 4497);
    			attr_dev(h21, "class", "mt2 mb1");
    			add_location(h21, file$c, 133, 12, 4638);
    			attr_dev(div, "slot", "content");
    			add_location(div, file$c, 130, 8, 4463);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h20);
    			append_dev(h20, t0);
    			append_dev(h20, t1);
    			append_dev(h20, t2);
    			append_dev(h20, t3);
    			append_dev(div, t4);
    			mount_component(progress0, div, null);
    			append_dev(div, t5);
    			append_dev(div, h21);
    			append_dev(div, t7);
    			mount_component(progress1, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*st*/ 1) && t2_value !== (t2_value = /*st*/ ctx[0].opened.num + "")) set_data_dev(t2, t2_value);
    			const progress0_changes = {};
    			if (dirty & /*st*/ 1) progress0_changes.value = /*st*/ ctx[0].opened.val;
    			progress0.$set(progress0_changes);
    			const progress1_changes = {};
    			if (dirty & /*st*/ 1) progress1_changes.value = /*st*/ ctx[0].progress.val;
    			progress1.$set(progress1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress0.$$.fragment, local);
    			transition_in(progress1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress0.$$.fragment, local);
    			transition_out(progress1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progress0);
    			destroy_component(progress1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot_1.name,
    		type: "slot",
    		source: "(131:8) ",
    		ctx
    	});

    	return block;
    }

    // (140:8) 
    function create_content_slot(ctx) {
    	let div;
    	let h2;
    	let t0_value = Lang.get("solved") + "";
    	let t0;
    	let t1;
    	let t2_value = /*st*/ ctx[0].closed.num + "";
    	let t2;
    	let t3;
    	let t4;
    	let gauge;
    	let t5;
    	let h30;
    	let t6_value = Lang.get("high-priority") + "";
    	let t6;
    	let t7;
    	let t8_value = /*st*/ ctx[0].alta.tot + "";
    	let t8;
    	let t9;
    	let t10;
    	let progress0;
    	let t11;
    	let h31;
    	let t12_value = Lang.get("medium-priority") + "";
    	let t12;
    	let t13;
    	let t14_value = /*st*/ ctx[0].media.tot + "";
    	let t14;
    	let t15;
    	let t16;
    	let progress1;
    	let t17;
    	let h32;
    	let t18_value = Lang.get("low-priority") + "";
    	let t18;
    	let t19;
    	let t20_value = /*st*/ ctx[0].baja.tot + "";
    	let t20;
    	let t21;
    	let t22;
    	let progress2;
    	let current;

    	gauge = new Gauge({
    			props: { value: /*st*/ ctx[0].porcent.val },
    			$$inline: true
    		});

    	progress0 = new Progress({
    			props: {
    				value: /*st*/ ctx[0].alta.val,
    				color: "red"
    			},
    			$$inline: true
    		});

    	progress1 = new Progress({
    			props: {
    				value: /*st*/ ctx[0].media.val,
    				color: "yellow"
    			},
    			$$inline: true
    		});

    	progress2 = new Progress({
    			props: {
    				value: /*st*/ ctx[0].baja.val,
    				color: "green"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = text(" (");
    			t2 = text(t2_value);
    			t3 = text(")");
    			t4 = space();
    			create_component(gauge.$$.fragment);
    			t5 = space();
    			h30 = element("h3");
    			t6 = text(t6_value);
    			t7 = text(" (");
    			t8 = text(t8_value);
    			t9 = text(")");
    			t10 = space();
    			create_component(progress0.$$.fragment);
    			t11 = space();
    			h31 = element("h3");
    			t12 = text(t12_value);
    			t13 = text(" (");
    			t14 = text(t14_value);
    			t15 = text(")");
    			t16 = space();
    			create_component(progress1.$$.fragment);
    			t17 = space();
    			h32 = element("h3");
    			t18 = text(t18_value);
    			t19 = text(" (");
    			t20 = text(t20_value);
    			t21 = text(")");
    			t22 = space();
    			create_component(progress2.$$.fragment);
    			attr_dev(h2, "class", "mt2 mb1");
    			add_location(h2, file$c, 140, 12, 4846);
    			attr_dev(h30, "class", "mt2 mb1");
    			add_location(h30, file$c, 142, 12, 4969);
    			attr_dev(h31, "class", "mt2 mb1");
    			add_location(h31, file$c, 144, 12, 5109);
    			attr_dev(h32, "class", "mt2 mb1");
    			add_location(h32, file$c, 148, 12, 5288);
    			attr_dev(div, "slot", "content");
    			add_location(div, file$c, 139, 8, 4812);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(h2, t3);
    			append_dev(div, t4);
    			mount_component(gauge, div, null);
    			append_dev(div, t5);
    			append_dev(div, h30);
    			append_dev(h30, t6);
    			append_dev(h30, t7);
    			append_dev(h30, t8);
    			append_dev(h30, t9);
    			append_dev(div, t10);
    			mount_component(progress0, div, null);
    			append_dev(div, t11);
    			append_dev(div, h31);
    			append_dev(h31, t12);
    			append_dev(h31, t13);
    			append_dev(h31, t14);
    			append_dev(h31, t15);
    			append_dev(div, t16);
    			mount_component(progress1, div, null);
    			append_dev(div, t17);
    			append_dev(div, h32);
    			append_dev(h32, t18);
    			append_dev(h32, t19);
    			append_dev(h32, t20);
    			append_dev(h32, t21);
    			append_dev(div, t22);
    			mount_component(progress2, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*st*/ 1) && t2_value !== (t2_value = /*st*/ ctx[0].closed.num + "")) set_data_dev(t2, t2_value);
    			const gauge_changes = {};
    			if (dirty & /*st*/ 1) gauge_changes.value = /*st*/ ctx[0].porcent.val;
    			gauge.$set(gauge_changes);
    			if ((!current || dirty & /*st*/ 1) && t8_value !== (t8_value = /*st*/ ctx[0].alta.tot + "")) set_data_dev(t8, t8_value);
    			const progress0_changes = {};
    			if (dirty & /*st*/ 1) progress0_changes.value = /*st*/ ctx[0].alta.val;
    			progress0.$set(progress0_changes);
    			if ((!current || dirty & /*st*/ 1) && t14_value !== (t14_value = /*st*/ ctx[0].media.tot + "")) set_data_dev(t14, t14_value);
    			const progress1_changes = {};
    			if (dirty & /*st*/ 1) progress1_changes.value = /*st*/ ctx[0].media.val;
    			progress1.$set(progress1_changes);
    			if ((!current || dirty & /*st*/ 1) && t20_value !== (t20_value = /*st*/ ctx[0].baja.tot + "")) set_data_dev(t20, t20_value);
    			const progress2_changes = {};
    			if (dirty & /*st*/ 1) progress2_changes.value = /*st*/ ctx[0].baja.val;
    			progress2.$set(progress2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gauge.$$.fragment, local);
    			transition_in(progress0.$$.fragment, local);
    			transition_in(progress1.$$.fragment, local);
    			transition_in(progress2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gauge.$$.fragment, local);
    			transition_out(progress0.$$.fragment, local);
    			transition_out(progress1.$$.fragment, local);
    			transition_out(progress2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(gauge);
    			destroy_component(progress0);
    			destroy_component(progress1);
    			destroy_component(progress2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_content_slot.name,
    		type: "slot",
    		source: "(140:8) ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let buttonselect;
    	let t;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;

    	buttonselect = new ButtonSelect({
    			props: { id: "Project", label: /*label*/ ctx[1] },
    			$$inline: true
    		});

    	buttonselect.$on("EventSelect", /*onSelect*/ ctx[3]);
    	const if_block_creators = [create_if_block$8, create_else_block$4];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[2]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			create_component(buttonselect.$$.fragment);
    			t = space();
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(buttonselect, target, anchor);
    			insert_dev(target, t, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const buttonselect_changes = {};
    			if (dirty & /*label*/ 2) buttonselect_changes.label = /*label*/ ctx[1];
    			buttonselect.$set(buttonselect_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttonselect.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttonselect.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(buttonselect, detaching);
    			if (detaching) detach_dev(t);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Statistics', slots, []);
    	let st = {};
    	let label = "";
    	let loading = true;
    	let project = { id: 0, name: "" };
    	const setLabel = d => $$invalidate(1, label = d.id ? d.name : Lang.get("select-project"));

    	const setProject = res => {
    		setLabel(res);
    		project = res;
    		State.set("project", project);
    	};

    	const initData = () => {
    		return {
    			progress: { val: 0, num: 0, tot: 0 },
    			opened: { val: 0, num: 0, tot: 0 },
    			closed: { val: 0, num: 0, tot: 0 },
    			baja: { val: 0, num: 0, tot: 0 },
    			media: { val: 0, num: 0, tot: 0 },
    			alta: { val: 0, num: 0, tot: 0 },
    			porcent: { val: 0, num: 0, tot: 0 }
    		};
    	};

    	const cc = (rs, tot) => tot ? Math.round(rs.num / tot * 100) : 0;

    	function statistics(dd) {
    		$$invalidate(0, st = initData());
    		$$invalidate(0, st.opened.num = 0, st);
    		$$invalidate(0, st.closed.num = 0, st);

    		for (const id in dd) {
    			$$invalidate(0, st.porcent.tot += dd[id].opened + dd[id].closed, st);
    			$$invalidate(0, st.closed.num += dd[id].closed, st);
    			$$invalidate(0, st.opened.num += dd[id].opened, st);
    			$$invalidate(0, st[id].tot = dd[id].opened + dd[id].closed, st);
    			$$invalidate(0, st[id].num = dd[id].closed, st);

    			$$invalidate(
    				0,
    				st[id].val = st[id].tot
    				? Math.round(st[id].num / st[id].tot * 100)
    				: 0,
    				st
    			);
    		}

    		$$invalidate(0, st.opened.val = cc(st.opened, st.porcent.tot), st);
    		$$invalidate(0, st.closed.val = cc(st.closed, st.porcent.tot), st);
    		$$invalidate(0, st.porcent.val = st.closed.val / 100, st);
    	}

    	const onSelect = evt => {
    		const res = evt.detail;

    		if (res.data) {
    			if (res.data.id) {
    				$$invalidate(2, loading = true);

    				//console.log("statistics tasks data :::", res.data);
    				setProject(res.data);

    				Command.send("task/get-statistics", res.data, dd => {
    					const ds = {};
    					ds[project.id] = dd;
    					State.set("tasks-0", []);
    					State.set("tasks-1", []);
    					State.set("statistics", ds);
    					statistics(dd);

    					progressAt(() => {
    						$$invalidate(2, loading = false);
    					});
    				});
    			}
    		} else {
    			Command.send("project/search", { key: res.value }, res.fun);
    		}
    	};

    	const calcProgress = (dd, calback) => {

    		for (let x in dd) {
    			if (dd[x].state === "opened") {
    				$$invalidate(0, st.progress.tot += 100, st);
    				$$invalidate(0, st.progress.num += dd[x].progress, st);
    			}
    		}

    		$$invalidate(0, st.progress.val = cc(st.progress, st.progress.tot), st);
    		calback();
    	};

    	const progressAt = callback => {
    		if (!st.opened.num) return callback();
    		let dd = State.get("tasks-0");

    		if (dd && dd.length) {
    			//console.log("list task state", dd);
    			return calcProgress(dd, callback);
    		}

    		Command.send("task/list-opened", project, rs => {
    			//console.log("list task", rs);
    			calcProgress(rs, callback);
    		});
    	};

    	const getStatisticsData = () => {
    		const rs = State.get("statistics", []);

    		rs[0] = {
    			baja: { opened: 0, closed: 0 },
    			media: { opened: 0, closed: 0 },
    			alta: { opened: 0, closed: 0 }
    		};

    		return rs;
    	};

    	onMount(() => {
    		setProject(State.get("project", project));
    		const res = getStatisticsData();

    		//console.log("statistics ", res);
    		if (res && res[project.id]) {
    			statistics(res[project.id]);

    			progressAt(() => {
    				$$invalidate(2, loading = false);
    			});
    		} else onSelect({ detail: { data: project } });
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Statistics> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ButtonSelect,
    		Gauge,
    		Progress,
    		Spinner,
    		Card,
    		Lang,
    		Command,
    		State,
    		onMount,
    		st,
    		label,
    		loading,
    		project,
    		setLabel,
    		setProject,
    		initData,
    		cc,
    		statistics,
    		onSelect,
    		calcProgress,
    		progressAt,
    		getStatisticsData
    	});

    	$$self.$inject_state = $$props => {
    		if ('st' in $$props) $$invalidate(0, st = $$props.st);
    		if ('label' in $$props) $$invalidate(1, label = $$props.label);
    		if ('loading' in $$props) $$invalidate(2, loading = $$props.loading);
    		if ('project' in $$props) project = $$props.project;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [st, label, loading, onSelect];
    }

    class Statistics extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Statistics",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* webviews\App\Dash.svelte generated by Svelte v3.48.0 */

    // (37:0) {:else}
    function create_else_block$3(ctx) {
    	let profile;
    	let t;
    	let statistics;
    	let current;

    	profile = new Profile({
    			props: { user: /*user*/ ctx[1] },
    			$$inline: true
    		});

    	statistics = new Statistics({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(profile.$$.fragment);
    			t = space();
    			create_component(statistics.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(profile, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(statistics, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const profile_changes = {};
    			if (dirty & /*user*/ 2) profile_changes.user = /*user*/ ctx[1];
    			profile.$set(profile_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(profile.$$.fragment, local);
    			transition_in(statistics.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(profile.$$.fragment, local);
    			transition_out(statistics.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(profile, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(statistics, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(37:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (35:0) {#if loading}
    function create_if_block$7(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$7.name,
    		type: "if",
    		source: "(35:0) {#if loading}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$c(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$7, create_else_block$3];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dash', slots, []);
    	let loading = true;
    	let user = {};

    	const getUser = callback => {
    		let rd = Session.get();
    		if (rd && rd.id) return callback(rd);

    		Command.send("user/get-data", dd => {
    			if (dd && dd.id) {
    				Session.set(dd);
    				return callback(dd);
    			}

    			callback(null);
    		});
    	};

    	onMount(() => {
    		getUser(rd => {
    			if (rd) {
    				//console.log("user get data: ", rd);
    				$$invalidate(1, user = rd);

    				$$invalidate(0, loading = false);
    			} else Command.send("session/form-login");
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dash> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Spinner,
    		Profile,
    		Statistics,
    		onMount,
    		Command,
    		Session,
    		loading,
    		user,
    		getUser
    	});

    	$$self.$inject_state = $$props => {
    		if ('loading' in $$props) $$invalidate(0, loading = $$props.loading);
    		if ('user' in $$props) $$invalidate(1, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [loading, user];
    }

    class Dash extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dash",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* webviews\App\Task\List\Options.svelte generated by Svelte v3.48.0 */
    const file$b = "webviews\\App\\Task\\List\\Options.svelte";

    // (8:4) {#if Session.allow()}
    function create_if_block$6(ctx) {
    	let span;
    	let i0;
    	let t;
    	let i1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			i0 = element("i");
    			t = space();
    			i1 = element("i");
    			attr_dev(i0, "class", "fas fa-trash red svelte-qryer4");
    			add_location(i0, file$b, 9, 13, 233);
    			attr_dev(span, "class", "svelte-qryer4");
    			add_location(span, file$b, 8, 8, 184);
    			attr_dev(i1, "class", "line svelte-qryer4");
    			add_location(i1, file$b, 11, 8, 290);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i0);
    			insert_dev(target, t, anchor);
    			insert_dev(target, i1, anchor);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(i1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$6.name,
    		type: "if",
    		source: "(8:4) {#if Session.allow()}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let span1;
    	let show_if = Session.allow();
    	let t;
    	let span0;
    	let i;
    	let mounted;
    	let dispose;
    	let if_block = show_if && create_if_block$6(ctx);

    	const block = {
    		c: function create() {
    			span1 = element("span");
    			if (if_block) if_block.c();
    			t = space();
    			span0 = element("span");
    			i = element("i");
    			attr_dev(i, "class", "fa fa-edit blue");
    			add_location(i, file$b, 13, 39, 360);
    			attr_dev(span0, "class", "svelte-qryer4");
    			add_location(span0, file$b, 13, 4, 325);
    			attr_dev(span1, "class", "opc text-center svelte-qryer4");
    			add_location(span1, file$b, 6, 0, 117);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span1, anchor);
    			if (if_block) if_block.m(span1, null);
    			append_dev(span1, t);
    			append_dev(span1, span0);
    			append_dev(span0, i);

    			if (!mounted) {
    				dispose = listen_dev(span0, "click", /*click_handler_1*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (show_if) if_block.p(ctx, dirty);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Options', slots, []);

    	let { selOpc = opc => {
    		
    	} } = $$props;

    	const writable_props = ['selOpc'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Options> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => selOpc("D");
    	const click_handler_1 = () => selOpc("E");

    	$$self.$$set = $$props => {
    		if ('selOpc' in $$props) $$invalidate(0, selOpc = $$props.selOpc);
    	};

    	$$self.$capture_state = () => ({ Session, selOpc });

    	$$self.$inject_state = $$props => {
    		if ('selOpc' in $$props) $$invalidate(0, selOpc = $$props.selOpc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selOpc, click_handler, click_handler_1];
    }

    class Options extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { selOpc: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Options",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get selOpc() {
    		throw new Error("<Options>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selOpc(value) {
    		throw new Error("<Options>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\Task\List\Menu.svelte generated by Svelte v3.48.0 */
    const file$a = "webviews\\App\\Task\\List\\Menu.svelte";

    function create_fragment$a(ctx) {
    	let div1;
    	let i;
    	let t0;
    	let span;
    	let t2;
    	let div0;
    	let options;
    	let current;

    	options = new Options({
    			props: { selOpc: /*selOpc*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			i = element("i");
    			t0 = space();
    			span = element("span");
    			span.textContent = "•••";
    			t2 = space();
    			div0 = element("div");
    			create_component(options.$$.fragment);
    			attr_dev(i, "class", "db2 svelte-1z13r7b");
    			attr_dev(i, "tabindex", "0");
    			add_location(i, file$a, 6, 4, 144);
    			attr_dev(span, "class", "dropbtn svelte-1z13r7b");
    			add_location(span, file$a, 7, 4, 180);
    			attr_dev(div0, "class", "dropdown-content svelte-1z13r7b");
    			attr_dev(div0, "tabindex", "0");
    			add_location(div0, file$a, 8, 4, 218);
    			attr_dev(div1, "class", "dropdown svelte-1z13r7b");
    			attr_dev(div1, "tabindex", "0");
    			add_location(div1, file$a, 5, 0, 103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, i);
    			append_dev(div1, t0);
    			append_dev(div1, span);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			mount_component(options, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const options_changes = {};
    			if (dirty & /*selOpc*/ 1) options_changes.selOpc = /*selOpc*/ ctx[0];
    			options.$set(options_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(options.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(options.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(options);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Menu', slots, []);

    	let { selOpc = () => {
    		
    	} } = $$props;

    	const writable_props = ['selOpc'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Menu> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('selOpc' in $$props) $$invalidate(0, selOpc = $$props.selOpc);
    	};

    	$$self.$capture_state = () => ({ Options, selOpc });

    	$$self.$inject_state = $$props => {
    		if ('selOpc' in $$props) $$invalidate(0, selOpc = $$props.selOpc);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selOpc];
    }

    class Menu extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { selOpc: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Menu",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get selOpc() {
    		throw new Error("<Menu>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selOpc(value) {
    		throw new Error("<Menu>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\Task\List\Item.svelte generated by Svelte v3.48.0 */
    const file$9 = "webviews\\App\\Task\\List\\Item.svelte";

    // (86:8) {#if user.id === task.author.id && task.state === "opened"}
    function create_if_block_2$3(ctx) {
    	let span;
    	let menuoptions;
    	let current;

    	menuoptions = new Menu({
    			props: { selOpc: /*func*/ ctx[13] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			span = element("span");
    			create_component(menuoptions.$$.fragment);
    			attr_dev(span, "class", "menu svelte-1f1z2nf");
    			add_location(span, file$9, 86, 12, 3027);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			mount_component(menuoptions, span, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const menuoptions_changes = {};
    			if (dirty & /*selOpc, task*/ 3) menuoptions_changes.selOpc = /*func*/ ctx[13];
    			menuoptions.$set(menuoptions_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(menuoptions.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(menuoptions.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			destroy_component(menuoptions);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$3.name,
    		type: "if",
    		source: "(86:8) {#if user.id === task.author.id && task.state === \\\"opened\\\"}",
    		ctx
    	});

    	return block;
    }

    // (98:12) {#if showProgress === idProgress && task.state === "opened"}
    function create_if_block_1$3(ctx) {
    	let div;
    	let input0;
    	let t;
    	let datalist;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let option4;
    	let option5;
    	let option6;
    	let option7;
    	let option8;
    	let option9;
    	let option10;
    	let input1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			input0 = element("input");
    			t = space();
    			datalist = element("datalist");
    			option0 = element("option");
    			option1 = element("option");
    			option2 = element("option");
    			option3 = element("option");
    			option4 = element("option");
    			option5 = element("option");
    			option6 = element("option");
    			option7 = element("option");
    			option8 = element("option");
    			option9 = element("option");
    			option10 = element("option");
    			input1 = element("input");
    			attr_dev(input0, "type", "range");
    			attr_dev(input0, "class", "input-range");
    			attr_dev(input0, "step", "10");
    			attr_dev(input0, "list", "tickmarks");
    			add_location(input0, file$9, 99, 20, 3516);
    			option0.__value = "0";
    			option0.value = option0.__value;
    			attr_dev(option0, "label", "0%");
    			add_location(option0, file$9, 108, 24, 3883);
    			option1.__value = "10";
    			option1.value = option1.__value;
    			add_location(option1, file$9, 109, 24, 3940);
    			option2.__value = "20";
    			option2.value = option2.__value;
    			add_location(option2, file$9, 110, 24, 3987);
    			option3.__value = "30";
    			option3.value = option3.__value;
    			add_location(option3, file$9, 111, 24, 4034);
    			option4.__value = "40";
    			option4.value = option4.__value;
    			add_location(option4, file$9, 112, 24, 4081);
    			option5.__value = "50";
    			option5.value = option5.__value;
    			attr_dev(option5, "label", "50%");
    			add_location(option5, file$9, 113, 24, 4128);
    			option6.__value = "60";
    			option6.value = option6.__value;
    			add_location(option6, file$9, 114, 24, 4187);
    			option7.__value = "70";
    			option7.value = option7.__value;
    			add_location(option7, file$9, 115, 24, 4234);
    			option8.__value = "80";
    			option8.value = option8.__value;
    			add_location(option8, file$9, 116, 24, 4281);
    			option9.__value = "90";
    			option9.value = option9.__value;
    			add_location(option9, file$9, 117, 24, 4328);
    			option10.__value = "100";
    			option10.value = option10.__value;
    			attr_dev(option10, "label", "100%");
    			add_location(option10, file$9, 118, 24, 4375);
    			add_location(input1, file$9, 119, 24, 4436);
    			attr_dev(datalist, "id", "tickmarks");
    			add_location(datalist, file$9, 107, 20, 3832);
    			add_location(div, file$9, 98, 16, 3489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input0);
    			set_input_value(input0, /*valueProgress*/ ctx[2]);
    			append_dev(div, t);
    			append_dev(div, datalist);
    			append_dev(datalist, option0);
    			append_dev(datalist, option1);
    			append_dev(datalist, option2);
    			append_dev(datalist, option3);
    			append_dev(datalist, option4);
    			append_dev(datalist, option5);
    			append_dev(datalist, option6);
    			append_dev(datalist, option7);
    			append_dev(datalist, option8);
    			append_dev(datalist, option9);
    			append_dev(datalist, option10);
    			append_dev(datalist, input1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "change", /*handleProgress*/ ctx[10], false, false, false),
    					listen_dev(input0, "change", /*input0_change_input_handler*/ ctx[15]),
    					listen_dev(input0, "input", /*input0_change_input_handler*/ ctx[15])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*valueProgress*/ 4) {
    				set_input_value(input0, /*valueProgress*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(98:12) {#if showProgress === idProgress && task.state === \\\"opened\\\"}",
    		ctx
    	});

    	return block;
    }

    // (129:4) {#if task.assignee &&  task.assignee.id !== user.id}
    function create_if_block$5(ctx) {
    	let footer;
    	let strong;
    	let t2;
    	let div;
    	let img;
    	let img_src_value;
    	let t3;
    	let span;
    	let t4_value = /*task*/ ctx[0].assignee.name + "";
    	let t4;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			strong = element("strong");
    			strong.textContent = `${Lang.get('assign')}:`;
    			t2 = space();
    			div = element("div");
    			img = element("img");
    			t3 = space();
    			span = element("span");
    			t4 = text(t4_value);
    			attr_dev(strong, "class", "svelte-1f1z2nf");
    			add_location(strong, file$9, 130, 12, 4798);
    			if (!src_url_equal(img.src, img_src_value = /*task*/ ctx[0].assignee.avatar_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1f1z2nf");
    			add_location(img, file$9, 132, 16, 4873);
    			attr_dev(span, "class", "svelte-1f1z2nf");
    			add_location(span, file$9, 133, 16, 4936);
    			attr_dev(div, "class", "svelte-1f1z2nf");
    			add_location(div, file$9, 131, 12, 4850);
    			attr_dev(footer, "class", "svelte-1f1z2nf");
    			add_location(footer, file$9, 129, 8, 4776);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    			append_dev(footer, strong);
    			append_dev(footer, t2);
    			append_dev(footer, div);
    			append_dev(div, img);
    			append_dev(div, t3);
    			append_dev(div, span);
    			append_dev(span, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*task*/ 1 && !src_url_equal(img.src, img_src_value = /*task*/ ctx[0].assignee.avatar_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*task*/ 1 && t4_value !== (t4_value = /*task*/ ctx[0].assignee.name + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(129:4) {#if task.assignee &&  task.assignee.id !== user.id}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let message_item;
    	let div0;
    	let div0_class_value;
    	let t0;
    	let input;
    	let t1;
    	let span0;
    	let i0;
    	let t2;
    	let header;
    	let div1;
    	let span1;
    	let t3_value = /*task*/ ctx[0].title + "";
    	let t3;
    	let t4;
    	let span2;
    	let t5_value = /*task*/ ctx[0].dueDate + "";
    	let t5;
    	let t6;
    	let t7;
    	let main;
    	let p;
    	let t8_value = /*task*/ ctx[0].description + "";
    	let t8;
    	let t9;
    	let div3;
    	let div2;
    	let progress_1;
    	let t10;
    	let t11;
    	let span3;
    	let i1;
    	let t12;
    	let t13_value = /*task*/ ctx[0].comments + "";
    	let t13;
    	let t14;
    	let t15;
    	let message_item_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*user*/ ctx[4].id === /*task*/ ctx[0].author.id && /*task*/ ctx[0].state === "opened" && create_if_block_2$3(ctx);

    	progress_1 = new Progress({
    			props: {
    				value: /*valueProgress*/ ctx[2],
    				color: "cyan"
    			},
    			$$inline: true
    		});

    	let if_block1 = /*showProgress*/ ctx[3] === /*idProgress*/ ctx[8] && /*task*/ ctx[0].state === "opened" && create_if_block_1$3(ctx);
    	let if_block2 = /*task*/ ctx[0].assignee && /*task*/ ctx[0].assignee.id !== /*user*/ ctx[4].id && create_if_block$5(ctx);

    	const block = {
    		c: function create() {
    			message_item = element("message-item");
    			div0 = element("div");
    			t0 = space();
    			input = element("input");
    			t1 = space();
    			span0 = element("span");
    			i0 = element("i");
    			t2 = space();
    			header = element("header");
    			div1 = element("div");
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			span2 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			if (if_block0) if_block0.c();
    			t7 = space();
    			main = element("main");
    			p = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(progress_1.$$.fragment);
    			t10 = space();
    			if (if_block1) if_block1.c();
    			t11 = space();
    			span3 = element("span");
    			i1 = element("i");
    			t12 = text(" Comentarios (");
    			t13 = text(t13_value);
    			t14 = text(")");
    			t15 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div0, "class", div0_class_value = "tag " + /*priority*/ ctx[6] + " svelte-1f1z2nf");
    			add_location(div0, file$9, 75, 4, 2551);
    			attr_dev(input, "class", "checkbox svelte-1f1z2nf");
    			attr_dev(input, "type", "checkbox");
    			input.checked = /*checked*/ ctx[5];
    			add_location(input, file$9, 76, 4, 2587);
    			attr_dev(i0, "class", "fa fa-bell  svelte-1f1z2nf");
    			add_location(i0, file$9, 78, 8, 2707);
    			attr_dev(span0, "class", "notify " + /*notify*/ ctx[7] + " svelte-1f1z2nf");
    			add_location(span0, file$9, 77, 4, 2667);
    			attr_dev(span1, "class", "subject svelte-1f1z2nf");
    			add_location(span1, file$9, 82, 12, 2833);
    			attr_dev(span2, "class", "date svelte-1f1z2nf");
    			add_location(span2, file$9, 83, 12, 2888);
    			attr_dev(div1, "class", "sender-info svelte-1f1z2nf");
    			add_location(div1, file$9, 81, 8, 2769);
    			attr_dev(header, "class", "svelte-1f1z2nf");
    			add_location(header, file$9, 80, 4, 2751);
    			attr_dev(p, "class", "svelte-1f1z2nf");
    			add_location(p, file$9, 92, 8, 3196);
    			attr_dev(div2, "class", "progress svelte-1f1z2nf");
    			add_location(div2, file$9, 94, 12, 3250);
    			attr_dev(i1, "class", "fa fa-comment");
    			add_location(i1, file$9, 124, 14, 4598);
    			attr_dev(span3, "class", "comment svelte-1f1z2nf");
    			add_location(span3, file$9, 123, 12, 4535);
    			attr_dev(div3, "class", "svelte-1f1z2nf");
    			add_location(div3, file$9, 93, 8, 3231);
    			attr_dev(main, "class", "svelte-1f1z2nf");
    			add_location(main, file$9, 91, 4, 3180);
    			set_custom_element_data(message_item, "class", message_item_class_value = "" + (null_to_empty(/*task*/ ctx[0].state === "opened" ? "unread" : "done") + " svelte-1f1z2nf"));
    			add_location(message_item, file$9, 74, 0, 2479);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, message_item, anchor);
    			append_dev(message_item, div0);
    			append_dev(message_item, t0);
    			append_dev(message_item, input);
    			append_dev(message_item, t1);
    			append_dev(message_item, span0);
    			append_dev(span0, i0);
    			append_dev(message_item, t2);
    			append_dev(message_item, header);
    			append_dev(header, div1);
    			append_dev(div1, span1);
    			append_dev(span1, t3);
    			append_dev(div1, t4);
    			append_dev(div1, span2);
    			append_dev(span2, t5);
    			append_dev(header, t6);
    			if (if_block0) if_block0.m(header, null);
    			append_dev(message_item, t7);
    			append_dev(message_item, main);
    			append_dev(main, p);
    			append_dev(p, t8);
    			append_dev(main, t9);
    			append_dev(main, div3);
    			append_dev(div3, div2);
    			mount_component(progress_1, div2, null);
    			append_dev(div3, t10);
    			if (if_block1) if_block1.m(div3, null);
    			append_dev(div3, t11);
    			append_dev(div3, span3);
    			append_dev(span3, i1);
    			append_dev(span3, t12);
    			append_dev(span3, t13);
    			append_dev(span3, t14);
    			append_dev(message_item, t15);
    			if (if_block2) if_block2.m(message_item, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*checkItem*/ ctx[9], false, false, false),
    					listen_dev(div1, "click", /*handleComment*/ ctx[12], false, false, false),
    					listen_dev(div2, "click", /*click_handler*/ ctx[14], false, false, false),
    					listen_dev(span3, "click", /*handleComment*/ ctx[12], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*priority*/ 64 && div0_class_value !== (div0_class_value = "tag " + /*priority*/ ctx[6] + " svelte-1f1z2nf")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*checked*/ 32) {
    				prop_dev(input, "checked", /*checked*/ ctx[5]);
    			}

    			if ((!current || dirty & /*task*/ 1) && t3_value !== (t3_value = /*task*/ ctx[0].title + "")) set_data_dev(t3, t3_value);
    			if ((!current || dirty & /*task*/ 1) && t5_value !== (t5_value = /*task*/ ctx[0].dueDate + "")) set_data_dev(t5, t5_value);

    			if (/*user*/ ctx[4].id === /*task*/ ctx[0].author.id && /*task*/ ctx[0].state === "opened") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*user, task*/ 17) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_2$3(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(header, null);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if ((!current || dirty & /*task*/ 1) && t8_value !== (t8_value = /*task*/ ctx[0].description + "")) set_data_dev(t8, t8_value);
    			const progress_1_changes = {};
    			if (dirty & /*valueProgress*/ 4) progress_1_changes.value = /*valueProgress*/ ctx[2];
    			progress_1.$set(progress_1_changes);

    			if (/*showProgress*/ ctx[3] === /*idProgress*/ ctx[8] && /*task*/ ctx[0].state === "opened") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(div3, t11);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*task*/ 1) && t13_value !== (t13_value = /*task*/ ctx[0].comments + "")) set_data_dev(t13, t13_value);

    			if (/*task*/ ctx[0].assignee && /*task*/ ctx[0].assignee.id !== /*user*/ ctx[4].id) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block$5(ctx);
    					if_block2.c();
    					if_block2.m(message_item, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (!current || dirty & /*task*/ 1 && message_item_class_value !== (message_item_class_value = "" + (null_to_empty(/*task*/ ctx[0].state === "opened" ? "unread" : "done") + " svelte-1f1z2nf"))) {
    				set_custom_element_data(message_item, "class", message_item_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(progress_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(progress_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(message_item);
    			if (if_block0) if_block0.d();
    			destroy_component(progress_1);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Item', slots, []);

    	let { selOpc = () => {
    		
    	} } = $$props;

    	let { task = {} } = $$props;
    	let notify = 'none';
    	let valueProgress = 0;
    	let showProgress = "";
    	const inOf = name => task.labels.indexOf(name) > -1;

    	const hs = name => {
    		const idx = task.labels.indexOf(name);
    		return idx > -1 ? task.labels[idx] : undefined;
    	};

    	const pry = () => hs("alta") || hs("media") || hs("baja") || "none";

    	const getProgress = () => {
    		$$invalidate(3, showProgress = "");
    		let val = 0;
    		for (let x = 0; x <= 10; x++) val = inOf((x * 10).toString()) ? x * 10 : val;
    		if (valueProgress !== undefined) $$invalidate(2, valueProgress = val);
    		return val;
    	};

    	let user = {};
    	let idProgress = task.id;
    	let progress = 0;
    	let checked = "";
    	let priority = "none";

    	//$: notify = task.labels.indexOf('100') >=0 ?'info':'none';
    	const checkItem = () => {
    		$$invalidate(0, task.state = task.state === "opened" ? "closed" : "opened", task);
    		$$invalidate(0, task.progress = task.state === "closed" ? 0 : 1, task);

    		Command.send("task/state", task, rs => {
    			State.run("refresh");
    			Command.send("web-task/refresh", task);
    		}); //console.log("TASKS::", rs);
    	};

    	const handleProgress = () => {
    		progress = valueProgress / 100;
    		$$invalidate(0, task.labels = [priority, valueProgress.toString()], task);

    		//console.log(task.labels);
    		Command.send("task/labels", task, rs => {
    			State.run("refresh");
    			Command.send("web-task/refresh", task);
    		}); //console.log("TASKS::", rs);
    	};

    	const onProgress = payload => {
    		if (task.state === "opened") {
    			$$invalidate(3, showProgress = payload === showProgress ? "" : payload);
    		}
    	};

    	const handleComment = () => {
    		Command.send("web-task/comments", task);
    	};

    	onMount(() => {
    		$$invalidate(4, user = Session.get());
    	});

    	const writable_props = ['selOpc', 'task'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Item> was created with unknown prop '${key}'`);
    	});

    	const func = op => selOpc(op + ":" + task.id);
    	const click_handler = () => onProgress(idProgress);

    	function input0_change_input_handler() {
    		valueProgress = to_number(this.value);
    		$$invalidate(2, valueProgress);
    	}

    	$$self.$$set = $$props => {
    		if ('selOpc' in $$props) $$invalidate(1, selOpc = $$props.selOpc);
    		if ('task' in $$props) $$invalidate(0, task = $$props.task);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Command,
    		State,
    		MenuOptions: Menu,
    		Progress,
    		Session,
    		Lang,
    		selOpc,
    		task,
    		notify,
    		valueProgress,
    		showProgress,
    		inOf,
    		hs,
    		pry,
    		getProgress,
    		user,
    		idProgress,
    		progress,
    		checked,
    		priority,
    		checkItem,
    		handleProgress,
    		onProgress,
    		handleComment
    	});

    	$$self.$inject_state = $$props => {
    		if ('selOpc' in $$props) $$invalidate(1, selOpc = $$props.selOpc);
    		if ('task' in $$props) $$invalidate(0, task = $$props.task);
    		if ('notify' in $$props) $$invalidate(7, notify = $$props.notify);
    		if ('valueProgress' in $$props) $$invalidate(2, valueProgress = $$props.valueProgress);
    		if ('showProgress' in $$props) $$invalidate(3, showProgress = $$props.showProgress);
    		if ('user' in $$props) $$invalidate(4, user = $$props.user);
    		if ('idProgress' in $$props) $$invalidate(8, idProgress = $$props.idProgress);
    		if ('progress' in $$props) progress = $$props.progress;
    		if ('checked' in $$props) $$invalidate(5, checked = $$props.checked);
    		if ('priority' in $$props) $$invalidate(6, priority = $$props.priority);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*task*/ 1) {
    			$$invalidate(6, priority = pry(task.labels));
    		}

    		if ($$self.$$.dirty & /*task*/ 1) {
    			$$invalidate(5, checked = task.state === "closed" ? "checked" : "");
    		}

    		if ($$self.$$.dirty & /*task*/ 1) {
    			progress = getProgress(task.labels) / 100;
    		}
    	};

    	return [
    		task,
    		selOpc,
    		valueProgress,
    		showProgress,
    		user,
    		checked,
    		priority,
    		notify,
    		idProgress,
    		checkItem,
    		handleProgress,
    		onProgress,
    		handleComment,
    		func,
    		click_handler,
    		input0_change_input_handler
    	];
    }

    class Item extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { selOpc: 1, task: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Item",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get selOpc() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selOpc(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get task() {
    		throw new Error("<Item>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set task(value) {
    		throw new Error("<Item>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\Task\List\index.svelte generated by Svelte v3.48.0 */
    const file$8 = "webviews\\App\\Task\\List\\index.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (24:0) {:else}
    function create_else_block$2(ctx) {
    	let t_value = Lang.get("no-tasks-" + (State.get("filter_tasks") ? "delegated" : "assigned")) + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(24:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (16:0) {#if tasks instanceof Array && tasks.length}
    function create_if_block$4(ctx) {
    	let div1;
    	let div0;
    	let current;
    	let each_value = /*tasks*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "inbox-list svelte-w7ar0m");
    			add_location(div0, file$8, 17, 8, 457);
    			attr_dev(div1, "class", "inbox svelte-w7ar0m");
    			add_location(div1, file$8, 16, 4, 428);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tasks, selOpc*/ 3) {
    				each_value = /*tasks*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(16:0) {#if tasks instanceof Array && tasks.length}",
    		ctx
    	});

    	return block;
    }

    // (19:12) {#each tasks as task}
    function create_each_block$4(ctx) {
    	let item;
    	let current;

    	item = new Item({
    			props: {
    				task: /*task*/ ctx[2],
    				selOpc: /*selOpc*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(item.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(item, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const item_changes = {};
    			if (dirty & /*tasks*/ 2) item_changes.task = /*task*/ ctx[2];
    			if (dirty & /*selOpc*/ 1) item_changes.selOpc = /*selOpc*/ ctx[0];
    			item.$set(item_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(item.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(item.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(item, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(19:12) {#each tasks as task}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$4, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*tasks*/ ctx[1] instanceof Array && /*tasks*/ ctx[1].length) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('List', slots, []);

    	let { selOpc = () => {
    		
    	} } = $$props;

    	let { tasks = [] } = $$props;

    	onMount(() => {
    		Page.setScroll("tasks");
    	});

    	const writable_props = ['selOpc', 'tasks'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('selOpc' in $$props) $$invalidate(0, selOpc = $$props.selOpc);
    		if ('tasks' in $$props) $$invalidate(1, tasks = $$props.tasks);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Lang,
    		State,
    		Page,
    		Item,
    		selOpc,
    		tasks
    	});

    	$$self.$inject_state = $$props => {
    		if ('selOpc' in $$props) $$invalidate(0, selOpc = $$props.selOpc);
    		if ('tasks' in $$props) $$invalidate(1, tasks = $$props.tasks);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [selOpc, tasks];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, { selOpc: 0, tasks: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get selOpc() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selOpc(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tasks() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tasks(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\Task\New.svelte generated by Svelte v3.48.0 */
    const file$7 = "webviews\\App\\Task\\New.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[19] = list[i];
    	return child_ctx;
    }

    // (117:0) {:else}
    function create_else_block$1(ctx) {
    	let form;
    	let h3;
    	let t1;
    	let h40;
    	let t2_value = Lang.get(/*task*/ ctx[0].id ? "edit-task" : "new-task") + "";
    	let t2;
    	let t3;
    	let input0;
    	let t4;
    	let textarea;
    	let t5;
    	let select0;
    	let t6;
    	let select1;
    	let option0;
    	let option1;
    	let option2;
    	let option3;
    	let t11;
    	let h41;
    	let t14;
    	let input1;
    	let t15;
    	let br;
    	let t16;
    	let div;
    	let button;
    	let t17_value = Lang.get(/*task*/ ctx[0].id ? "save" : "add") + "";
    	let t17;
    	let mounted;
    	let dispose;
    	let each_value = /*users*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			form = element("form");
    			h3 = element("h3");
    			h3.textContent = `${/*project*/ ctx[5].name}`;
    			t1 = space();
    			h40 = element("h4");
    			t2 = text(t2_value);
    			t3 = space();
    			input0 = element("input");
    			t4 = space();
    			textarea = element("textarea");
    			t5 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			select1 = element("select");
    			option0 = element("option");
    			option0.textContent = `${Lang.get("select-priority")}`;
    			option1 = element("option");
    			option1.textContent = `${Lang.get("low-priority")}`;
    			option2 = element("option");
    			option2.textContent = `${Lang.get("medium-priority")}`;
    			option3 = element("option");
    			option3.textContent = `${Lang.get("high-priority")}`;
    			t11 = space();
    			h41 = element("h4");
    			h41.textContent = `${Lang.get("deadline")}:`;
    			t14 = space();
    			input1 = element("input");
    			t15 = space();
    			br = element("br");
    			t16 = space();
    			div = element("div");
    			button = element("button");
    			t17 = text(t17_value);
    			add_location(h3, file$7, 118, 8, 4126);
    			attr_dev(h40, "class", "mb1");
    			add_location(h40, file$7, 119, 8, 4159);
    			input0.required = true;
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "input mb1");
    			attr_dev(input0, "placeholder", Lang.get("title"));
    			add_location(input0, file$7, 120, 8, 4236);
    			attr_dev(textarea, "class", "textarea mb2");
    			attr_dev(textarea, "rows", "4");
    			attr_dev(textarea, "placeholder", Lang.get("description"));
    			add_location(textarea, file$7, 128, 8, 4458);
    			attr_dev(select0, "id", "idUsers");
    			attr_dev(select0, "class", "select mb2");
    			select0.required = true;
    			if (/*data*/ ctx[4].idUser === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[10].call(select0));
    			add_location(select0, file$7, 134, 8, 4639);
    			option0.__value = "";
    			option0.value = option0.__value;
    			add_location(option0, file$7, 146, 12, 5002);
    			option1.__value = "baja";
    			option1.value = option1.__value;
    			add_location(option1, file$7, 147, 12, 5071);
    			option2.__value = "media";
    			option2.value = option2.__value;
    			add_location(option2, file$7, 148, 12, 5141);
    			option3.__value = "alta";
    			option3.value = option3.__value;
    			add_location(option3, file$7, 149, 12, 5215);
    			attr_dev(select1, "class", "select mb1");
    			select1.required = true;
    			if (/*data*/ ctx[4].priority === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[11].call(select1));
    			add_location(select1, file$7, 145, 8, 4925);
    			attr_dev(h41, "class", "mb1");
    			add_location(h41, file$7, 152, 8, 5303);
    			attr_dev(input1, "type", "date");
    			attr_dev(input1, "clas", "mb1");
    			add_location(input1, file$7, 153, 8, 5357);
    			add_location(br, file$7, 154, 8, 5422);
    			attr_dev(button, "class", "btn");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$7, 156, 12, 5469);
    			attr_dev(div, "class", "mt1");
    			add_location(div, file$7, 155, 8, 5438);
    			attr_dev(form, "class", "p1");
    			add_location(form, file$7, 117, 4, 4057);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h3);
    			append_dev(form, t1);
    			append_dev(form, h40);
    			append_dev(h40, t2);
    			append_dev(form, t3);
    			append_dev(form, input0);
    			/*input0_binding*/ ctx[7](input0);
    			set_input_value(input0, /*data*/ ctx[4].title);
    			append_dev(form, t4);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*data*/ ctx[4].description);
    			append_dev(form, t5);
    			append_dev(form, select0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(select0, null);
    			}

    			select_option(select0, /*data*/ ctx[4].idUser);
    			append_dev(form, t6);
    			append_dev(form, select1);
    			append_dev(select1, option0);
    			append_dev(select1, option1);
    			append_dev(select1, option2);
    			append_dev(select1, option3);
    			select_option(select1, /*data*/ ctx[4].priority);
    			append_dev(form, t11);
    			append_dev(form, h41);
    			append_dev(form, t14);
    			append_dev(form, input1);
    			set_input_value(input1, /*data*/ ctx[4].date);
    			append_dev(form, t15);
    			append_dev(form, br);
    			append_dev(form, t16);
    			append_dev(form, div);
    			append_dev(div, button);
    			append_dev(button, t17);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[8]),
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[9]),
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[10]),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(form, "submit", prevent_default(/*handleOnSubmit*/ ctx[6]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*task*/ 1 && t2_value !== (t2_value = Lang.get(/*task*/ ctx[0].id ? "edit-task" : "new-task") + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*data, users*/ 24 && input0.value !== /*data*/ ctx[4].title) {
    				set_input_value(input0, /*data*/ ctx[4].title);
    			}

    			if (dirty & /*data, users*/ 24) {
    				set_input_value(textarea, /*data*/ ctx[4].description);
    			}

    			if (dirty & /*users*/ 8) {
    				each_value = /*users*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*data, users*/ 24) {
    				select_option(select0, /*data*/ ctx[4].idUser);
    			}

    			if (dirty & /*data, users*/ 24) {
    				select_option(select1, /*data*/ ctx[4].priority);
    			}

    			if (dirty & /*data, users*/ 24) {
    				set_input_value(input1, /*data*/ ctx[4].date);
    			}

    			if (dirty & /*task*/ 1 && t17_value !== (t17_value = Lang.get(/*task*/ ctx[0].id ? "save" : "add") + "")) set_data_dev(t17, t17_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			/*input0_binding*/ ctx[7](null);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(117:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (115:0) {#if loading}
    function create_if_block$3(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(115:0) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (141:12) {#each users as user}
    function create_each_block$3(ctx) {
    	let option;
    	let t_value = /*user*/ ctx[19].value + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*user*/ ctx[19].id;
    			option.value = option.__value;
    			add_location(option, file$7, 141, 16, 4828);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*users*/ 8 && t_value !== (t_value = /*user*/ ctx[19].value + "")) set_data_dev(t, t_value);

    			if (dirty & /*users*/ 8 && option_value_value !== (option_value_value = /*user*/ ctx[19].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(141:12) {#each users as user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('New', slots, []);
    	let { task = {} } = $$props;
    	const dispatch = createEventDispatcher();
    	let loading = true;
    	let project = State.get("project");
    	let itmTitle = null;
    	let users = [];
    	let data = {};

    	const hs = name => {
    		if (task && task.labels) {
    			const idx = task.labels.indexOf(name);
    			return idx > -1 ? task.labels[idx] : undefined;
    		}

    		return undefined;
    	};

    	const pry = () => hs("alta") || hs("media") || hs("baja") || "";

    	function addTask() {
    		Command.send("task/add", data, dd => {
    			if (dd && dd.id) {
    				const user = Session.get();
    				const ty = dd.assignee.id === user.id ? 0 : 1;
    				const tasks = State.get("tasks-" + ty, []);
    				const res = State.get("statistics");

    				if (res && res[dd.idProject]) {
    					res[dd.idProject] = undefined;
    					State.set("statistics", res);
    				}

    				tasks.unshift(dd);
    				State.set("tasks-" + ty, tasks);
    				State.set("filter_state", 0);
    				State.set("filter_priority", 0);
    				dispatch("EventAdded", { op: "add", opc: "tasks_" + ty });
    			} else {
    				Command.send("onError", Lang.key(dd ? dd.message || "err" : "err"));
    			}
    		});
    	}

    	function updTask() {
    		if (task.labels.indexOf(data.priority) === -1) {
    			const rs = [];

    			for (const x in task.labels) {
    				if (["alta", "media", "baja"].indexOf(task.labels[x]) === -1) rs.push(task.labels[x]);
    			}

    			rs.push(data.priority);
    			$$invalidate(4, data.labels = rs, data);
    		}

    		$$invalidate(4, data.id = task.id, data);
    		$$invalidate(4, data.idProject = project.id, data);

    		Command.send("task/upd", data, dd => {
    			if (dd && dd.id) {
    				const user = Session.get();
    				const ty = dd.assignee.id === user.id ? 0 : 1;
    				State.get("tasks-" + ty, []);
    				const res = State.get("statistics");

    				if (res && res[dd.idProject]) {
    					res[dd.idProject] = undefined;
    					State.set("statistics", res);
    				}

    				State.set("tasks-0", []);
    				State.set("tasks-1", []);
    				dispatch("EventAdded", { op: "upd", opc: "tasks_" + ty });
    			} else {
    				Command.send("onError", Lang.key(dd ? dd.message || "err" : "err"));
    			}
    		});
    	}

    	function handleOnSubmit() {
    		task.id ? "edit" : "add";

    		//console.log("submit");
    		$$invalidate(4, data.idProject = project.id, data);

    		if (task.id) updTask(); else addTask();
    	}

    	function getData(rd) {
    		$$invalidate(4, data = {
    			date: (rd.dueDate || "") + "",
    			title: (rd.title || "") + "",
    			description: (rd.description || "") + "",
    			idProject: project.id,
    			idUser: (rd.assignee ? rd.assignee.id : "") || "",
    			priority: pry() || ""
    		});

    		//console.log("result task: ", data);
    		return data;
    	}

    	onMount(() => {
    		Command.send("user/list-by-project", { id: project.id }, dd => {
    			dd.unshift({
    				id: "",
    				value: Lang.get("assign-user") + "..."
    			});

    			$$invalidate(3, users = dd);
    			$$invalidate(4, data = getData(task));
    			$$invalidate(1, loading = false);
    		});
    	});

    	const writable_props = ['task'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<New> was created with unknown prop '${key}'`);
    	});

    	function input0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			itmTitle = $$value;
    			$$invalidate(2, itmTitle);
    		});
    	}

    	function input0_input_handler() {
    		data.title = this.value;
    		$$invalidate(4, data);
    		$$invalidate(3, users);
    	}

    	function textarea_input_handler() {
    		data.description = this.value;
    		$$invalidate(4, data);
    		$$invalidate(3, users);
    	}

    	function select0_change_handler() {
    		data.idUser = select_value(this);
    		$$invalidate(4, data);
    		$$invalidate(3, users);
    	}

    	function select1_change_handler() {
    		data.priority = select_value(this);
    		$$invalidate(4, data);
    		$$invalidate(3, users);
    	}

    	function input1_input_handler() {
    		data.date = this.value;
    		$$invalidate(4, data);
    		$$invalidate(3, users);
    	}

    	$$self.$$set = $$props => {
    		if ('task' in $$props) $$invalidate(0, task = $$props.task);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		State,
    		Lang,
    		Command,
    		Spinner,
    		Session,
    		task,
    		dispatch,
    		loading,
    		project,
    		itmTitle,
    		users,
    		data,
    		hs,
    		pry,
    		addTask,
    		updTask,
    		handleOnSubmit,
    		getData
    	});

    	$$self.$inject_state = $$props => {
    		if ('task' in $$props) $$invalidate(0, task = $$props.task);
    		if ('loading' in $$props) $$invalidate(1, loading = $$props.loading);
    		if ('project' in $$props) $$invalidate(5, project = $$props.project);
    		if ('itmTitle' in $$props) $$invalidate(2, itmTitle = $$props.itmTitle);
    		if ('users' in $$props) $$invalidate(3, users = $$props.users);
    		if ('data' in $$props) $$invalidate(4, data = $$props.data);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		task,
    		loading,
    		itmTitle,
    		users,
    		data,
    		project,
    		handleOnSubmit,
    		input0_binding,
    		input0_input_handler,
    		textarea_input_handler,
    		select0_change_handler,
    		select1_change_handler,
    		input1_input_handler
    	];
    }

    class New extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { task: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "New",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get task() {
    		throw new Error("<New>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set task(value) {
    		throw new Error("<New>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\Task\Delete.svelte generated by Svelte v3.48.0 */
    const file$6 = "webviews\\App\\Task\\Delete.svelte";

    function create_fragment$6(ctx) {
    	let form;
    	let h3;
    	let t1;
    	let h40;
    	let t3;
    	let span0;
    	let t4_value = /*task*/ ctx[0].title + "";
    	let t4;
    	let t5;
    	let p;
    	let t6_value = /*task*/ ctx[0].description + "";
    	let t6;
    	let t7;
    	let h41;
    	let t9;
    	let span1;
    	let t10_value = /*task*/ ctx[0].dueDate + "";
    	let t10;
    	let t11;
    	let br;
    	let t12;
    	let h42;
    	let t14;
    	let div;
    	let input;
    	let t15;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			h3 = element("h3");
    			h3.textContent = `${/*project*/ ctx[1].name}`;
    			t1 = space();
    			h40 = element("h4");
    			h40.textContent = `${Lang.get("delete-task")}`;
    			t3 = space();
    			span0 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			p = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			h41 = element("h4");
    			h41.textContent = `${Lang.get("deadline")}`;
    			t9 = space();
    			span1 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			br = element("br");
    			t12 = space();
    			h42 = element("h4");
    			h42.textContent = `${Lang.get("are-you-sure-you-want-to-delete")}`;
    			t14 = space();
    			div = element("div");
    			input = element("input");
    			t15 = space();
    			button = element("button");
    			button.textContent = `${Lang.get("remove")}`;
    			add_location(h3, file$6, 39, 4, 1409);
    			attr_dev(h40, "class", "mb1");
    			add_location(h40, file$6, 40, 4, 1438);
    			attr_dev(span0, "class", "input mb1 svelte-6q1ovs");
    			add_location(span0, file$6, 41, 4, 1490);
    			attr_dev(p, "class", "input mb1 svelte-6q1ovs");
    			add_location(p, file$6, 42, 4, 1540);
    			attr_dev(h41, "class", "mb1");
    			add_location(h41, file$6, 43, 4, 1589);
    			attr_dev(span1, "class", "mb1 svelte-6q1ovs");
    			add_location(span1, file$6, 44, 4, 1638);
    			add_location(br, file$6, 45, 4, 1683);
    			add_location(h42, file$6, 46, 4, 1695);
    			attr_dev(input, "class", "btn");
    			attr_dev(input, "type", "button");
    			input.value = Lang.get("cancel");
    			add_location(input, file$6, 48, 8, 1787);
    			attr_dev(button, "class", "btn");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$6, 54, 8, 1940);
    			attr_dev(div, "class", "flex mt1");
    			add_location(div, file$6, 47, 4, 1755);
    			attr_dev(form, "class", "p1");
    			add_location(form, file$6, 38, 0, 1344);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, h3);
    			append_dev(form, t1);
    			append_dev(form, h40);
    			append_dev(form, t3);
    			append_dev(form, span0);
    			append_dev(span0, t4);
    			append_dev(form, t5);
    			append_dev(form, p);
    			append_dev(p, t6);
    			append_dev(form, t7);
    			append_dev(form, h41);
    			append_dev(form, t9);
    			append_dev(form, span1);
    			append_dev(span1, t10);
    			append_dev(form, t11);
    			append_dev(form, br);
    			append_dev(form, t12);
    			append_dev(form, h42);
    			append_dev(form, t14);
    			append_dev(form, div);
    			append_dev(div, input);
    			append_dev(div, t15);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "click", /*onCancel*/ ctx[3], false, false, false),
    					listen_dev(form, "submit", prevent_default(/*handleOnSubmit*/ ctx[2]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*task*/ 1 && t4_value !== (t4_value = /*task*/ ctx[0].title + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*task*/ 1 && t6_value !== (t6_value = /*task*/ ctx[0].description + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*task*/ 1 && t10_value !== (t10_value = /*task*/ ctx[0].dueDate + "")) set_data_dev(t10, t10_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Delete', slots, []);
    	let { task = {} } = $$props;
    	const dispatch = createEventDispatcher();
    	let project = State.get("project");

    	function handleOnSubmit() {
    		//console.log("submit");
    		Command.send("task/del", task, dd => {
    			//console.log("del: result delete task", dd);
    			if (dd && dd.id) {
    				const tk = State.get("filter_tasks", 0);
    				State.get("tasks-" + tk, []);
    				const res = State.get("statistics");

    				if (res && res[dd.idProject]) {
    					res[dd.idProject] = undefined;
    					State.set("statistics", res);
    				}

    				State.set("tasks-0", []);
    				State.set("tasks-1", []);
    				dispatch("EventDeleted", { op: "del", opc: "tasks_" + tk });
    			} else {
    				Command.send("onError", Lang.key(dd ? dd.message || "err" : "err"));
    			}
    		});
    	}

    	function onCancel() {
    		dispatch("EventDeleted", { opc: "list" });
    	}

    	const writable_props = ['task'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Delete> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('task' in $$props) $$invalidate(0, task = $$props.task);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		State,
    		Command,
    		Lang,
    		task,
    		dispatch,
    		project,
    		handleOnSubmit,
    		onCancel
    	});

    	$$self.$inject_state = $$props => {
    		if ('task' in $$props) $$invalidate(0, task = $$props.task);
    		if ('project' in $$props) $$invalidate(1, project = $$props.project);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [task, project, handleOnSubmit, onCancel];
    }

    class Delete extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { task: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Delete",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get task() {
    		throw new Error("<Delete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set task(value) {
    		throw new Error("<Delete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\components\Dropdown.svelte generated by Svelte v3.48.0 */
    const file$5 = "webviews\\App\\components\\Dropdown.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (23:8) {#each btn.options as option, i}
    function create_each_block$2(ctx) {
    	let a;
    	let i_1;
    	let i_1_class_value;
    	let t0;
    	let t1_value = /*option*/ ctx[5].title + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*i*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			a = element("a");
    			i_1 = element("i");
    			t0 = space();
    			t1 = text(t1_value);
    			attr_dev(i_1, "class", i_1_class_value = "" + (null_to_empty(/*option*/ ctx[5].icon) + " svelte-fkivyy"));
    			add_location(i_1, file$5, 28, 19, 809);
    			attr_dev(a, "class", "item svelte-fkivyy");
    			attr_dev(a, "href", "#option");
    			add_location(a, file$5, 23, 12, 638);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, i_1);
    			append_dev(a, t0);
    			append_dev(a, t1);

    			if (!mounted) {
    				dispose = listen_dev(a, "click", prevent_default(click_handler), false, true, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*btn*/ 1 && i_1_class_value !== (i_1_class_value = "" + (null_to_empty(/*option*/ ctx[5].icon) + " svelte-fkivyy"))) {
    				attr_dev(i_1, "class", i_1_class_value);
    			}

    			if (dirty & /*btn*/ 1 && t1_value !== (t1_value = /*option*/ ctx[5].title + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(23:8) {#each btn.options as option, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div1;
    	let span;
    	let i;
    	let i_class_value;
    	let t;
    	let div0;
    	let each_value = /*btn*/ ctx[0].options;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span = element("span");
    			i = element("i");
    			t = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*current*/ ctx[1].icon) + " svelte-fkivyy"));
    			add_location(i, file$5, 20, 26, 513);
    			attr_dev(span, "class", "dropbtn svelte-fkivyy");
    			add_location(span, file$5, 20, 4, 491);
    			attr_dev(div0, "class", "dropdown-content svelte-fkivyy");
    			add_location(div0, file$5, 21, 4, 552);
    			attr_dev(div1, "class", "dropdown svelte-fkivyy");
    			add_location(div1, file$5, 19, 0, 463);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span);
    			append_dev(span, i);
    			append_dev(div1, t);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*current*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty(/*current*/ ctx[1].icon) + " svelte-fkivyy"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*onSeletect, btn*/ 5) {
    				each_value = /*btn*/ ctx[0].options;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dropdown', slots, []);
    	let { btn = { options: [] } } = $$props;
    	const dispatch = createEventDispatcher();
    	let current = { icon: "" };

    	const onSeletect = idx => {
    		$$invalidate(0, btn.selectedIndex = idx, btn);
    		$$invalidate(1, current = btn.options[btn.selectedIndex]);
    		dispatch("SelectedOption", btn);
    	};

    	onMount(() => {
    		$$invalidate(1, current = btn.options[btn.selectedIndex]);
    	});

    	const writable_props = ['btn'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dropdown> was created with unknown prop '${key}'`);
    	});

    	const click_handler = i => {
    		onSeletect(i);
    	};

    	$$self.$$set = $$props => {
    		if ('btn' in $$props) $$invalidate(0, btn = $$props.btn);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		btn,
    		dispatch,
    		current,
    		onSeletect
    	});

    	$$self.$inject_state = $$props => {
    		if ('btn' in $$props) $$invalidate(0, btn = $$props.btn);
    		if ('current' in $$props) $$invalidate(1, current = $$props.current);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [btn, current, onSeletect, click_handler];
    }

    class Dropdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { btn: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropdown",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get btn() {
    		throw new Error("<Dropdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set btn(value) {
    		throw new Error("<Dropdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\Task\Navbar.svelte generated by Svelte v3.48.0 */
    const file$4 = "webviews\\App\\Task\\Navbar.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (98:44) 
    function create_if_block_3$2(ctx) {
    	let span;
    	let i;
    	let i_class_value;
    	let t;
    	let span_title_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*btn*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			t = space();
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*btn*/ ctx[9].icon) + " svelte-ys0b1d"));
    			add_location(i, file$4, 102, 21, 3436);
    			attr_dev(span, "class", "btn svelte-ys0b1d");
    			attr_dev(span, "title", span_title_value = /*btn*/ ctx[9].title);
    			add_location(span, file$4, 98, 16, 3279);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*buttons*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*btn*/ ctx[9].icon) + " svelte-ys0b1d"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*buttons*/ 1 && span_title_value !== (span_title_value = /*btn*/ ctx[9].title)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$2.name,
    		type: "if",
    		source: "(98:44) ",
    		ctx
    	});

    	return block;
    }

    // (96:12) {#if btn.type === "dropdown"}
    function create_if_block_2$2(ctx) {
    	let dropdown;
    	let current;

    	dropdown = new Dropdown({
    			props: { btn: /*btn*/ ctx[9] },
    			$$inline: true
    		});

    	dropdown.$on("SelectedOption", /*btnToolbar*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(dropdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dropdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dropdown_changes = {};
    			if (dirty & /*buttons*/ 1) dropdown_changes.btn = /*btn*/ ctx[9];
    			dropdown.$set(dropdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dropdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(96:12) {#if btn.type === \\\"dropdown\\\"}",
    		ctx
    	});

    	return block;
    }

    // (95:8) {#each buttons.left as btn}
    function create_each_block_1$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2$2, create_if_block_3$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*btn*/ ctx[9].type === "dropdown") return 0;
    		if (/*btn*/ ctx[9].type === "button") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(95:8) {#each buttons.left as btn}",
    		ctx
    	});

    	return block;
    }

    // (112:44) 
    function create_if_block_1$2(ctx) {
    	let span;
    	let i;
    	let i_class_value;
    	let t;
    	let span_title_value;
    	let mounted;
    	let dispose;

    	function click_handler_1() {
    		return /*click_handler_1*/ ctx[4](/*btn*/ ctx[9]);
    	}

    	const block = {
    		c: function create() {
    			span = element("span");
    			i = element("i");
    			t = space();
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty(/*btn*/ ctx[9].icon) + " svelte-ys0b1d"));
    			add_location(i, file$4, 116, 21, 3928);
    			attr_dev(span, "class", "btn svelte-ys0b1d");
    			attr_dev(span, "title", span_title_value = /*btn*/ ctx[9].title);
    			add_location(span, file$4, 112, 16, 3771);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, i);
    			append_dev(span, t);

    			if (!mounted) {
    				dispose = listen_dev(span, "click", click_handler_1, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*buttons*/ 1 && i_class_value !== (i_class_value = "" + (null_to_empty(/*btn*/ ctx[9].icon) + " svelte-ys0b1d"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (dirty & /*buttons*/ 1 && span_title_value !== (span_title_value = /*btn*/ ctx[9].title)) {
    				attr_dev(span, "title", span_title_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(112:44) ",
    		ctx
    	});

    	return block;
    }

    // (110:12) {#if btn.type === "dropdown"}
    function create_if_block$2(ctx) {
    	let dropdown;
    	let current;

    	dropdown = new Dropdown({
    			props: { btn: /*btn*/ ctx[9] },
    			$$inline: true
    		});

    	dropdown.$on("EventSeletect", /*btnToolbar*/ ctx[1]);

    	const block = {
    		c: function create() {
    			create_component(dropdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dropdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dropdown_changes = {};
    			if (dirty & /*buttons*/ 1) dropdown_changes.btn = /*btn*/ ctx[9];
    			dropdown.$set(dropdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dropdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(110:12) {#if btn.type === \\\"dropdown\\\"}",
    		ctx
    	});

    	return block;
    }

    // (109:8) {#each buttons.right as btn}
    function create_each_block$1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$2, create_if_block_1$2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*btn*/ ctx[9].type === "dropdown") return 0;
    		if (/*btn*/ ctx[9].type === "button") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(109:8) {#each buttons.right as btn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div2;
    	let div0;
    	let t;
    	let div1;
    	let current;
    	let each_value_1 = /*buttons*/ ctx[0].left;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*buttons*/ ctx[0].right;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out_1 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "box-left svelte-ys0b1d");
    			add_location(div0, file$4, 93, 4, 3046);
    			attr_dev(div1, "class", "box-right svelte-ys0b1d");
    			add_location(div1, file$4, 107, 4, 3537);
    			attr_dev(div2, "class", "box-nav svelte-ys0b1d");
    			add_location(div2, file$4, 92, 0, 3019);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*buttons, btnToolbar*/ 3) {
    				each_value_1 = /*buttons*/ ctx[0].left;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*buttons, btnToolbar*/ 3) {
    				each_value = /*buttons*/ ctx[0].right;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	let { btns = "" } = $$props;
    	const dispatch = createEventDispatcher();
    	let buttons = { left: {}, right: {} };

    	const navItems = {
    		Priority: {
    			type: "dropdown",
    			id: "priority",
    			selectedIndex: State.get("filter_priority", 0),
    			options: [
    				{
    					title: Lang.get('all'),
    					icon: "fas fa-square blue"
    				},
    				{
    					title: Lang.get('high-priority'),
    					icon: "fas fa-square red"
    				},
    				{
    					title: Lang.get('medium-priority'),
    					icon: "fas fa-square yellow"
    				},
    				{
    					title: Lang.get('low-priority'),
    					icon: "fas fa-square green"
    				}
    			]
    		},
    		State: {
    			type: "dropdown",
    			id: "state",
    			selectedIndex: State.get("filter_state", 0),
    			options: [
    				{
    					title: Lang.get('all'),
    					icon: "far fa-square blue"
    				},
    				{
    					title: Lang.get('open'),
    					icon: "far fa-square orange"
    				},
    				{
    					title: Lang.get('close'),
    					icon: "far fa-check-square green"
    				}
    			]
    		},
    		Task: {
    			type: "dropdown",
    			id: "tasks",
    			selectedIndex: State.get("filter_tasks", 0),
    			options: [
    				{
    					title: Lang.get('assigned'),
    					icon: "far fa-user blue"
    				},
    				{
    					title: Lang.get("delegates"),
    					icon: "fas fa-users orange"
    				}
    			]
    		},
    		Add: {
    			type: "button",
    			id: "add",
    			title: Lang.get('new-task'),
    			icon: " fas fa-plus blue"
    		},
    		Back: {
    			type: "button",
    			id: "back",
    			title: Lang.get('back'),
    			icon: " fas fa-reply blue"
    		}
    	};

    	const parseBtn = btn => {
    		const rs = [];
    		const r = btn.split(",");

    		for (const x in r) {
    			if (navItems[r[x]]) {
    				const ix = navItems[r[x]];
    				ix.selectedIndex = State.get("filter_" + ix.id, 0);
    				rs.push(navItems[r[x]]);
    			}
    		}

    		return rs;
    	};

    	const parserButtons = dd => {
    		if (typeof dd === "string") {
    			const r = dd.split("/");
    			$$invalidate(0, buttons.left = r[0] ? parseBtn(r[0]) : [], buttons);
    			$$invalidate(0, buttons.right = r[0] ? parseBtn(r[1]) : [], buttons);
    		}

    		return buttons;
    	};

    	const btnToolbar = op => {
    		if (op instanceof CustomEvent) {
    			op = op.detail.id + "_" + op.detail.selectedIndex;
    		} else {
    			op = op;
    		}

    		//console.log(op);
    		dispatch("EventToolsBtns", { opc: op });
    	};

    	onMount(() => {
    		$$invalidate(0, buttons = parserButtons(btns));
    	});

    	const writable_props = ['btns'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = btn => btnToolbar(btn.id);
    	const click_handler_1 = btn => btnToolbar(btn.id);

    	$$self.$$set = $$props => {
    		if ('btns' in $$props) $$invalidate(2, btns = $$props.btns);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		createEventDispatcher,
    		Lang,
    		State,
    		Dropdown,
    		btns,
    		dispatch,
    		buttons,
    		navItems,
    		parseBtn,
    		parserButtons,
    		btnToolbar
    	});

    	$$self.$inject_state = $$props => {
    		if ('btns' in $$props) $$invalidate(2, btns = $$props.btns);
    		if ('buttons' in $$props) $$invalidate(0, buttons = $$props.buttons);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*btns*/ 4) {
    			$$invalidate(0, buttons = parserButtons(btns));
    		}
    	};

    	return [buttons, btnToolbar, btns, click_handler, click_handler_1];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { btns: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get btns() {
    		throw new Error("<Navbar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set btns(value) {
    		throw new Error("<Navbar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* webviews\App\Tasks.svelte generated by Svelte v3.48.0 */
    const file$3 = "webviews\\App\\Tasks.svelte";

    // (172:4) {#if show !== "new"}
    function create_if_block_5(ctx) {
    	let buttonselect;
    	let current;

    	buttonselect = new ButtonSelect({
    			props: { id: "Project", label: /*label*/ ctx[3] },
    			$$inline: true
    		});

    	buttonselect.$on("EventExpand", /*onExpand*/ ctx[6]);
    	buttonselect.$on("EventSelect", /*onSelect*/ ctx[8]);

    	const block = {
    		c: function create() {
    			create_component(buttonselect.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(buttonselect, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const buttonselect_changes = {};
    			if (dirty & /*label*/ 8) buttonselect_changes.label = /*label*/ ctx[3];
    			buttonselect.$set(buttonselect_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(buttonselect.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(buttonselect.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(buttonselect, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(172:4) {#if show !== \\\"new\\\"}",
    		ctx
    	});

    	return block;
    }

    // (180:4) {#if show !== "none"}
    function create_if_block_4$1(ctx) {
    	let navbar;
    	let current;

    	navbar = new Navbar({
    			props: { btns: /*btns*/ ctx[2] },
    			$$inline: true
    		});

    	navbar.$on("EventToolsBtns", /*onToolBar*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const navbar_changes = {};
    			if (dirty & /*btns*/ 4) navbar_changes.btns = /*btns*/ ctx[2];
    			navbar.$set(navbar_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(180:4) {#if show !== \\\"none\\\"}",
    		ctx
    	});

    	return block;
    }

    // (191:30) 
    function create_if_block_3$1(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(191:30) ",
    		ctx
    	});

    	return block;
    }

    // (189:29) 
    function create_if_block_2$1(ctx) {
    	let deletetask;
    	let current;

    	deletetask = new Delete({
    			props: { task: /*task*/ ctx[0] },
    			$$inline: true
    		});

    	deletetask.$on("EventDeleted", /*onToolBar*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(deletetask.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(deletetask, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const deletetask_changes = {};
    			if (dirty & /*task*/ 1) deletetask_changes.task = /*task*/ ctx[0];
    			deletetask.$set(deletetask_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(deletetask.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(deletetask.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(deletetask, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(189:29) ",
    		ctx
    	});

    	return block;
    }

    // (187:48) 
    function create_if_block_1$1(ctx) {
    	let newtask;
    	let current;

    	newtask = new New({
    			props: { task: /*task*/ ctx[0] },
    			$$inline: true
    		});

    	newtask.$on("EventAdded", /*onToolBar*/ ctx[7]);

    	const block = {
    		c: function create() {
    			create_component(newtask.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(newtask, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const newtask_changes = {};
    			if (dirty & /*task*/ 1) newtask_changes.task = /*task*/ ctx[0];
    			newtask.$set(newtask_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newtask.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newtask.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(newtask, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(187:48) ",
    		ctx
    	});

    	return block;
    }

    // (185:4) {#if show === "list"}
    function create_if_block$1(ctx) {
    	let inboxtask;
    	let current;

    	inboxtask = new List({
    			props: {
    				tasks: /*tasks*/ ctx[1],
    				selOpc: /*selOpc*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(inboxtask.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(inboxtask, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const inboxtask_changes = {};
    			if (dirty & /*tasks*/ 2) inboxtask_changes.tasks = /*tasks*/ ctx[1];
    			inboxtask.$set(inboxtask_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(inboxtask.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(inboxtask.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(inboxtask, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(185:4) {#if show === \\\"list\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let header;
    	let t0;
    	let header_class_value;
    	let t1;
    	let main;
    	let current_block_type_index;
    	let if_block2;
    	let main_class_value;
    	let current;
    	let if_block0 = /*show*/ ctx[4] !== "new" && create_if_block_5(ctx);
    	let if_block1 = /*show*/ ctx[4] !== "none" && create_if_block_4$1(ctx);
    	const if_block_creators = [create_if_block$1, create_if_block_1$1, create_if_block_2$1, create_if_block_3$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*show*/ ctx[4] === "list") return 0;
    		if (/*show*/ ctx[4] === "new" || /*show*/ ctx[4] === "edit") return 1;
    		if (/*show*/ ctx[4] === "del") return 2;
    		if (/*show*/ ctx[4] === "load") return 3;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			header = element("header");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			main = element("main");
    			if (if_block2) if_block2.c();
    			attr_dev(header, "class", header_class_value = "" + (null_to_empty(/*expand*/ ctx[5]) + " svelte-1ytldgb"));
    			add_location(header, file$3, 170, 0, 5339);
    			attr_dev(main, "class", main_class_value = "" + (null_to_empty(/*expand*/ ctx[5]) + " svelte-1ytldgb"));
    			add_location(main, file$3, 183, 0, 5667);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			if (if_block0) if_block0.m(header, null);
    			append_dev(header, t0);
    			if (if_block1) if_block1.m(header, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(main, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*show*/ ctx[4] !== "new") {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty & /*show*/ 16) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(header, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (/*show*/ ctx[4] !== "none") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*show*/ 16) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_4$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(header, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*expand*/ 32 && header_class_value !== (header_class_value = "" + (null_to_empty(/*expand*/ ctx[5]) + " svelte-1ytldgb"))) {
    				attr_dev(header, "class", header_class_value);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block2) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block2 = if_blocks[current_block_type_index];

    					if (!if_block2) {
    						if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block2.c();
    					} else {
    						if_block2.p(ctx, dirty);
    					}

    					transition_in(if_block2, 1);
    					if_block2.m(main, null);
    				} else {
    					if_block2 = null;
    				}
    			}

    			if (!current || dirty & /*expand*/ 32 && main_class_value !== (main_class_value = "" + (null_to_empty(/*expand*/ ctx[5]) + " svelte-1ytldgb"))) {
    				attr_dev(main, "class", main_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tasks', slots, []);
    	let project = { id: 0, name: "" };
    	let task = {};
    	let tasks = {};
    	let btns = "";
    	let label = "";
    	let show = "";
    	let expand = "";
    	let toolbar = {}; //objeto que controlara los metodos del toolbar
    	const setLabel = d => $$invalidate(3, label = d.id ? d.name : Lang.get("select-project"));

    	const setProject = res => {
    		setLabel(res);
    		project = res;
    		State.set("project", project);
    	};

    	const onExpand = evt => {
    		$$invalidate(5, expand = evt.detail ? "expand" : "");
    	};

    	const win = op => {
    		if (op === "list") {
    			if (project.id) {
    				$$invalidate(2, btns = "Priority,State,Task/Add");
    			} else return $$invalidate(4, show = "none");
    		} else if (op === "new") {
    			$$invalidate(0, task = {});
    			$$invalidate(2, btns = "Back/");
    		} else if (op === "edit") {
    			$$invalidate(2, btns = "Back/");
    		} else {
    			$$invalidate(2, btns = "");
    		}

    		$$invalidate(4, show = op);
    		if (typeof toolbar.set === "function") toolbar.set(btns);
    	};

    	const loadTasks = (ty, done) => {
    		//console.log('Task:',ty, project)
    		Command.send("task/list-data-" + ty, project, dd => {
    			//console.log('Task result:',dd)
    			State.set("tasks-" + ty, dd);

    			doneFilter(dd, done);
    		});
    	};

    	const filterPriority = dd => {
    		const rs = [];
    		const ty = State.get("filter_priority", 0);
    		if (ty === 0) return dd;

    		for (const x in dd) {
    			if (ty === 1 && dd[x].labels.indexOf("alta") > -1) rs.push(dd[x]); else if (ty === 2 && dd[x].labels.indexOf("media") > -1) rs.push(dd[x]); else if (ty === 3 && dd[x].labels.indexOf("baja") > -1) rs.push(dd[x]);
    		}

    		return rs;
    	};

    	const filterState = dd => {
    		const rs = [];
    		const ty = State.get("filter_state", 0);
    		if (ty === 0) return dd;

    		for (const x in dd) {
    			if (ty === 1 && dd[x].state === "opened") rs.push(dd[x]); else if (ty === 2 && dd[x].state === "closed") rs.push(dd[x]);
    		}

    		return rs;
    	};

    	const doneFilter = (dd, done) => {
    		dd = filterState(dd);
    		dd = filterPriority(dd);
    		$$invalidate(1, tasks = dd);
    		done("list");
    	};

    	const applyFilter = done => {
    		const ty = State.get("filter_tasks", 0);

    		//console.log('TASK: ty', ty);
    		let tk = State.get("tasks-" + ty, []);

    		//console.log('TASK:', tk);
    		if (tk && tk.length) {
    			doneFilter(tk, done);
    		} else {
    			win("load");

    			loadTasks(ty, () => {
    				done("list");
    			});
    		}
    	};

    	const saveFilter = (op, done) => {
    		const r = op.split("_");

    		if (r.length > 1) {
    			State.set("filter_" + r[0], parseInt(r[1]));
    			return applyFilter(done);
    		}

    		return done(op);
    	};

    	const btnToolbar = opc => {
    		saveFilter(opc, op => {
    			if (op === "add") win("new"); else if (op === "back") win("list"); else win(op);
    		});
    	};

    	const btnActions = () => {
    		applyFilter(() => {
    			
    		}); //
    	};

    	const onToolBar = evt => {
    		const res = evt.detail;

    		//console.log(res);
    		if (typeof res.set === "function") {
    			toolbar = res;
    			toolbar.set(btns);
    		}

    		if (res.op) btnActions(res.op);
    		if (res.opc) btnToolbar(res.opc);
    	};

    	const onSelect = evt => {
    		const res = evt.detail;

    		if (res.data) {
    			//console.log("::: data task :::", res.data);
    			setProject(res.data);

    			win("load");

    			loadTasks(State.get("filter_tasks", 0), () => {
    				win("list");
    			});
    		} else {
    			Command.send("project/search", { key: res.value }, res.fun);
    		}
    	};

    	function getById(id) {
    		for (const x in tasks) {
    			if (tasks[x].id === id) return tasks[x];
    		}

    		return {};
    	}

    	const selOpc = opc => {
    		const r = opc.split(":");

    		if (r[0] === "E") {
    			$$invalidate(0, task = getById(parseInt(r[1])));

    			//console.log(task);
    			win("edit");
    		} else if (r[0] === "D") {
    			$$invalidate(0, task = getById(parseInt(r[1])));

    			//console.log(task);
    			win("del");
    		}
    	}; //console.log("options: ", opc);

    	onMount(() => {
    		setProject(State.get("project", project));
    		win("load");

    		loadTasks(State.get("filter_tasks", 0), () => {
    			win("list");
    		});
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tasks> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		InboxTask: List,
    		NewTask: New,
    		DeleteTask: Delete,
    		Navbar,
    		ButtonSelect,
    		Spinner,
    		Command,
    		Lang,
    		State,
    		onMount,
    		project,
    		task,
    		tasks,
    		btns,
    		label,
    		show,
    		expand,
    		toolbar,
    		setLabel,
    		setProject,
    		onExpand,
    		win,
    		loadTasks,
    		filterPriority,
    		filterState,
    		doneFilter,
    		applyFilter,
    		saveFilter,
    		btnToolbar,
    		btnActions,
    		onToolBar,
    		onSelect,
    		getById,
    		selOpc
    	});

    	$$self.$inject_state = $$props => {
    		if ('project' in $$props) project = $$props.project;
    		if ('task' in $$props) $$invalidate(0, task = $$props.task);
    		if ('tasks' in $$props) $$invalidate(1, tasks = $$props.tasks);
    		if ('btns' in $$props) $$invalidate(2, btns = $$props.btns);
    		if ('label' in $$props) $$invalidate(3, label = $$props.label);
    		if ('show' in $$props) $$invalidate(4, show = $$props.show);
    		if ('expand' in $$props) $$invalidate(5, expand = $$props.expand);
    		if ('toolbar' in $$props) toolbar = $$props.toolbar;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [task, tasks, btns, label, show, expand, onExpand, onToolBar, onSelect, selOpc];
    }

    class Tasks extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tasks",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* webviews\App\Task\Detail.svelte generated by Svelte v3.48.0 */
    const file$2 = "webviews\\App\\Task\\Detail.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (72:0) {:else}
    function create_else_block(ctx) {
    	let h20;
    	let t0_value = /*task*/ ctx[2].title + "";
    	let t0;
    	let t1;
    	let div0;
    	let t2;
    	let div0_class_value;
    	let t3;
    	let hr0;
    	let t4;
    	let div8;
    	let div3;
    	let div2;
    	let strong0;
    	let t6;
    	let img;
    	let img_src_value;
    	let t7;
    	let div1;
    	let t8_value = /*task*/ ctx[2].author.username + "";
    	let t8;
    	let t9;
    	let t10;
    	let div7;
    	let strong1;
    	let t13;
    	let p0;
    	let t14_value = /*task*/ ctx[2].project.name + "";
    	let t14;
    	let t15;
    	let strong2;
    	let t18;
    	let p1;
    	let t19_value = /*task*/ ctx[2].description + "";
    	let t19;
    	let t20;
    	let strong3;
    	let t23;
    	let p2;
    	let t24_value = /*task*/ ctx[2].dueDate + "";
    	let t24;
    	let t25;
    	let strong4;
    	let t28;
    	let div4;
    	let progress;
    	let t29;
    	let strong5;
    	let t32;
    	let div6;
    	let div5;
    	let t33_value = /*task*/ ctx[2].priority + "";
    	let t33;
    	let div5_class_value;
    	let t34;
    	let t35;
    	let br;
    	let t36;
    	let hr1;
    	let t37;
    	let div9;
    	let h21;
    	let t38_value = Lang.get("comments") + "";
    	let t38;
    	let t39;
    	let t40_value = /*task*/ ctx[2].comments + "";
    	let t40;
    	let t41;
    	let t42;
    	let t43;
    	let current;
    	let if_block0 = /*task*/ ctx[2].assignee && /*task*/ ctx[2].assignee.id !== /*task*/ ctx[2].author.id && create_if_block_4(ctx);

    	progress = new Progress({
    			props: {
    				value: /*task*/ ctx[2].progress,
    				color: "cyan"
    			},
    			$$inline: true
    		});

    	let if_block1 = /*notes*/ ctx[5].length && create_if_block_3(ctx);
    	let each_value = /*comments*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function select_block_type_1(ctx, dirty) {
    		if (/*working*/ ctx[1]) return create_if_block_1;
    		if (/*task*/ ctx[2].state === "opened") return create_if_block_2;
    	}

    	let current_block_type = select_block_type_1(ctx);
    	let if_block2 = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			h20 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div0 = element("div");
    			t2 = text(/*state*/ ctx[6]);
    			t3 = space();
    			hr0 = element("hr");
    			t4 = space();
    			div8 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			strong0 = element("strong");
    			strong0.textContent = `${Lang.get("author")}`;
    			t6 = space();
    			img = element("img");
    			t7 = space();
    			div1 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			if (if_block0) if_block0.c();
    			t10 = space();
    			div7 = element("div");
    			strong1 = element("strong");
    			strong1.textContent = `${Lang.get("project")}:`;
    			t13 = space();
    			p0 = element("p");
    			t14 = text(t14_value);
    			t15 = space();
    			strong2 = element("strong");
    			strong2.textContent = `${Lang.get("description")}:`;
    			t18 = space();
    			p1 = element("p");
    			t19 = text(t19_value);
    			t20 = space();
    			strong3 = element("strong");
    			strong3.textContent = `${Lang.get("deadline")}:`;
    			t23 = space();
    			p2 = element("p");
    			t24 = text(t24_value);
    			t25 = space();
    			strong4 = element("strong");
    			strong4.textContent = `${Lang.get("progress-percentage")}:`;
    			t28 = space();
    			div4 = element("div");
    			create_component(progress.$$.fragment);
    			t29 = space();
    			strong5 = element("strong");
    			strong5.textContent = `${Lang.get("priority")}:`;
    			t32 = space();
    			div6 = element("div");
    			div5 = element("div");
    			t33 = text(t33_value);
    			t34 = space();
    			if (if_block1) if_block1.c();
    			t35 = space();
    			br = element("br");
    			t36 = space();
    			hr1 = element("hr");
    			t37 = space();
    			div9 = element("div");
    			h21 = element("h2");
    			t38 = text(t38_value);
    			t39 = text(" (");
    			t40 = text(t40_value);
    			t41 = text(")");
    			t42 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t43 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(h20, "class", "mb2");
    			add_location(h20, file$2, 72, 4, 2244);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty(/*task*/ ctx[2].state) + " svelte-1bhjsnz"));
    			add_location(div0, file$2, 73, 4, 2283);
    			attr_dev(hr0, "class", "svelte-1bhjsnz");
    			add_location(hr0, file$2, 74, 4, 2326);
    			attr_dev(strong0, "class", "mb1");
    			add_location(strong0, file$2, 78, 16, 2445);
    			if (!src_url_equal(img.src, img_src_value = /*task*/ ctx[2].author.avatar_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1bhjsnz");
    			add_location(img, file$2, 79, 16, 2512);
    			add_location(div1, file$2, 80, 16, 2573);
    			attr_dev(div2, "class", "text-center svelte-1bhjsnz");
    			add_location(div2, file$2, 77, 12, 2402);
    			attr_dev(div3, "class", "user svelte-1bhjsnz");
    			add_location(div3, file$2, 76, 8, 2370);
    			add_location(strong1, file$2, 93, 12, 3079);
    			attr_dev(p0, "class", "input mb1 svelte-1bhjsnz");
    			add_location(p0, file$2, 94, 12, 3132);
    			add_location(strong2, file$2, 95, 12, 3190);
    			attr_dev(p1, "class", "input mb1 svelte-1bhjsnz");
    			add_location(p1, file$2, 96, 12, 3247);
    			add_location(strong3, file$2, 97, 12, 3304);
    			attr_dev(p2, "class", "input mb2 svelte-1bhjsnz");
    			add_location(p2, file$2, 98, 12, 3358);
    			add_location(strong4, file$2, 99, 12, 3411);
    			attr_dev(div4, "class", "progress");
    			add_location(div4, file$2, 100, 12, 3476);
    			add_location(strong5, file$2, 103, 12, 3597);
    			attr_dev(div5, "class", div5_class_value = "tag " + /*task*/ ctx[2].priority + " svelte-1bhjsnz");
    			add_location(div5, file$2, 105, 16, 3686);
    			attr_dev(div6, "class", "mb2");
    			add_location(div6, file$2, 104, 12, 3651);
    			add_location(br, file$2, 116, 12, 4096);
    			attr_dev(div7, "class", "task svelte-1bhjsnz");
    			add_location(div7, file$2, 92, 8, 3047);
    			attr_dev(div8, "class", "flex mt1");
    			add_location(div8, file$2, 75, 4, 2338);
    			attr_dev(hr1, "class", "svelte-1bhjsnz");
    			add_location(hr1, file$2, 119, 4, 4136);
    			attr_dev(h21, "class", "mb3");
    			add_location(h21, file$2, 121, 8, 4163);
    			add_location(div9, file$2, 120, 4, 4148);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h20, anchor);
    			append_dev(h20, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t2);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, hr0, anchor);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div3);
    			append_dev(div3, div2);
    			append_dev(div2, strong0);
    			append_dev(div2, t6);
    			append_dev(div2, img);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, t8);
    			append_dev(div3, t9);
    			if (if_block0) if_block0.m(div3, null);
    			append_dev(div8, t10);
    			append_dev(div8, div7);
    			append_dev(div7, strong1);
    			append_dev(div7, t13);
    			append_dev(div7, p0);
    			append_dev(p0, t14);
    			append_dev(div7, t15);
    			append_dev(div7, strong2);
    			append_dev(div7, t18);
    			append_dev(div7, p1);
    			append_dev(p1, t19);
    			append_dev(div7, t20);
    			append_dev(div7, strong3);
    			append_dev(div7, t23);
    			append_dev(div7, p2);
    			append_dev(p2, t24);
    			append_dev(div7, t25);
    			append_dev(div7, strong4);
    			append_dev(div7, t28);
    			append_dev(div7, div4);
    			mount_component(progress, div4, null);
    			append_dev(div7, t29);
    			append_dev(div7, strong5);
    			append_dev(div7, t32);
    			append_dev(div7, div6);
    			append_dev(div6, div5);
    			append_dev(div5, t33);
    			append_dev(div7, t34);
    			if (if_block1) if_block1.m(div7, null);
    			append_dev(div7, t35);
    			append_dev(div7, br);
    			insert_dev(target, t36, anchor);
    			insert_dev(target, hr1, anchor);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, h21);
    			append_dev(h21, t38);
    			append_dev(h21, t39);
    			append_dev(h21, t40);
    			append_dev(h21, t41);
    			append_dev(div9, t42);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div9, null);
    			}

    			append_dev(div9, t43);
    			if (if_block2) if_block2.m(div9, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*task*/ 4) && t0_value !== (t0_value = /*task*/ ctx[2].title + "")) set_data_dev(t0, t0_value);
    			if (!current || dirty & /*state*/ 64) set_data_dev(t2, /*state*/ ctx[6]);

    			if (!current || dirty & /*task*/ 4 && div0_class_value !== (div0_class_value = "" + (null_to_empty(/*task*/ ctx[2].state) + " svelte-1bhjsnz"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*task*/ 4 && !src_url_equal(img.src, img_src_value = /*task*/ ctx[2].author.avatar_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || dirty & /*task*/ 4) && t8_value !== (t8_value = /*task*/ ctx[2].author.username + "")) set_data_dev(t8, t8_value);

    			if (/*task*/ ctx[2].assignee && /*task*/ ctx[2].assignee.id !== /*task*/ ctx[2].author.id) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div3, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*task*/ 4) && t14_value !== (t14_value = /*task*/ ctx[2].project.name + "")) set_data_dev(t14, t14_value);
    			if ((!current || dirty & /*task*/ 4) && t19_value !== (t19_value = /*task*/ ctx[2].description + "")) set_data_dev(t19, t19_value);
    			if ((!current || dirty & /*task*/ 4) && t24_value !== (t24_value = /*task*/ ctx[2].dueDate + "")) set_data_dev(t24, t24_value);
    			const progress_changes = {};
    			if (dirty & /*task*/ 4) progress_changes.value = /*task*/ ctx[2].progress;
    			progress.$set(progress_changes);
    			if ((!current || dirty & /*task*/ 4) && t33_value !== (t33_value = /*task*/ ctx[2].priority + "")) set_data_dev(t33, t33_value);

    			if (!current || dirty & /*task*/ 4 && div5_class_value !== (div5_class_value = "tag " + /*task*/ ctx[2].priority + " svelte-1bhjsnz")) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (/*notes*/ ctx[5].length) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div7, t35);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if ((!current || dirty & /*task*/ 4) && t40_value !== (t40_value = /*task*/ ctx[2].comments + "")) set_data_dev(t40, t40_value);

    			if (dirty & /*comments, Lang*/ 16) {
    				each_value = /*comments*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div9, t43);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (current_block_type === (current_block_type = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type && current_block_type(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(div9, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h20);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(hr0);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div8);
    			if (if_block0) if_block0.d();
    			destroy_component(progress);
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t36);
    			if (detaching) detach_dev(hr1);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(div9);
    			destroy_each(each_blocks, detaching);

    			if (if_block2) {
    				if_block2.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(72:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (70:0) {#if loading}
    function create_if_block(ctx) {
    	let spinner;
    	let current;
    	spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(spinner.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(70:0) {#if loading}",
    		ctx
    	});

    	return block;
    }

    // (83:12) {#if task.assignee && task.assignee.id !== task.author.id}
    function create_if_block_4(ctx) {
    	let hr;
    	let t0;
    	let div1;
    	let strong;
    	let t2;
    	let img;
    	let img_src_value;
    	let t3;
    	let div0;
    	let t4_value = /*task*/ ctx[2].assignee.username + "";
    	let t4;

    	const block = {
    		c: function create() {
    			hr = element("hr");
    			t0 = space();
    			div1 = element("div");
    			strong = element("strong");
    			strong.textContent = `${Lang.get("assign")}`;
    			t2 = space();
    			img = element("img");
    			t3 = space();
    			div0 = element("div");
    			t4 = text(t4_value);
    			attr_dev(hr, "class", "mt2 svelte-1bhjsnz");
    			add_location(hr, file$2, 83, 16, 2716);
    			attr_dev(strong, "class", "mb1");
    			add_location(strong, file$2, 85, 20, 2803);
    			if (!src_url_equal(img.src, img_src_value = /*task*/ ctx[2].assignee.avatar_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1bhjsnz");
    			add_location(img, file$2, 86, 20, 2874);
    			add_location(div0, file$2, 87, 20, 2941);
    			attr_dev(div1, "class", "text-center mt2 svelte-1bhjsnz");
    			add_location(div1, file$2, 84, 16, 2752);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, strong);
    			append_dev(div1, t2);
    			append_dev(div1, img);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*task*/ 4 && !src_url_equal(img.src, img_src_value = /*task*/ ctx[2].assignee.avatar_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*task*/ 4 && t4_value !== (t4_value = /*task*/ ctx[2].assignee.username + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(83:12) {#if task.assignee && task.assignee.id !== task.author.id}",
    		ctx
    	});

    	return block;
    }

    // (108:12) {#if notes.length}
    function create_if_block_3(ctx) {
    	let strong;
    	let t2;
    	let ul;
    	let each_value_1 = /*notes*/ ctx[5];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			strong = element("strong");
    			strong.textContent = `${Lang.get("logs")}:`;
    			t2 = space();
    			ul = element("ul");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(strong, file$2, 108, 16, 3810);
    			attr_dev(ul, "class", "ml3 fs-8px");
    			add_location(ul, file$2, 109, 16, 3864);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, strong, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, ul, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(ul, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notes*/ 32) {
    				each_value_1 = /*notes*/ ctx[5];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(ul, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(strong);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(ul);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(108:12) {#if notes.length}",
    		ctx
    	});

    	return block;
    }

    // (111:20) {#each notes as note}
    function create_each_block_1(ctx) {
    	let li;
    	let t0_value = /*note*/ ctx[14].createdAt + "";
    	let t0;
    	let t1;
    	let t2_value = /*note*/ ctx[14].body + "";
    	let t2;

    	const block = {
    		c: function create() {
    			li = element("li");
    			t0 = text(t0_value);
    			t1 = text(" - ");
    			t2 = text(t2_value);
    			attr_dev(li, "class", "fs8px");
    			add_location(li, file$2, 111, 24, 3956);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, li, anchor);
    			append_dev(li, t0);
    			append_dev(li, t1);
    			append_dev(li, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*notes*/ 32 && t0_value !== (t0_value = /*note*/ ctx[14].createdAt + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*notes*/ 32 && t2_value !== (t2_value = /*note*/ ctx[14].body + "")) set_data_dev(t2, t2_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(li);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(111:20) {#each notes as note}",
    		ctx
    	});

    	return block;
    }

    // (123:8) {#each comments as comment}
    function create_each_block(ctx) {
    	let div6;
    	let div2;
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let div0;
    	let t1_value = /*comment*/ ctx[11].author.username + "";
    	let t1;
    	let t2;
    	let div5;
    	let strong0;
    	let t5;
    	let div3;
    	let t6_value = /*comment*/ ctx[11].createdAt + "";
    	let t6;
    	let t7;
    	let strong1;
    	let t10;
    	let div4;
    	let t11_value = /*comment*/ ctx[11].body + "";
    	let t11;
    	let t12;
    	let hr;

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div5 = element("div");
    			strong0 = element("strong");
    			strong0.textContent = `${Lang.get("created-at")}:`;
    			t5 = space();
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			strong1 = element("strong");
    			strong1.textContent = `${Lang.get("comment")}:`;
    			t10 = space();
    			div4 = element("div");
    			t11 = text(t11_value);
    			t12 = space();
    			hr = element("hr");
    			if (!src_url_equal(img.src, img_src_value = /*comment*/ ctx[11].author.avatar_url)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1bhjsnz");
    			add_location(img, file$2, 126, 24, 4406);
    			add_location(div0, file$2, 127, 24, 4478);
    			attr_dev(div1, "class", "text-center svelte-1bhjsnz");
    			add_location(div1, file$2, 125, 20, 4355);
    			attr_dev(div2, "class", "user svelte-1bhjsnz");
    			add_location(div2, file$2, 124, 16, 4315);
    			add_location(strong0, file$2, 131, 20, 4624);
    			attr_dev(div3, "class", "input svelte-1bhjsnz");
    			add_location(div3, file$2, 132, 20, 4688);
    			add_location(strong1, file$2, 133, 20, 4754);
    			attr_dev(div4, "class", "input svelte-1bhjsnz");
    			add_location(div4, file$2, 134, 20, 4815);
    			attr_dev(div5, "class", "task svelte-1bhjsnz");
    			add_location(div5, file$2, 130, 16, 4584);
    			attr_dev(div6, "class", "flex mb2");
    			add_location(div6, file$2, 123, 12, 4275);
    			attr_dev(hr, "class", "mb2 svelte-1bhjsnz");
    			add_location(hr, file$2, 137, 12, 4912);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			append_dev(div0, t1);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, strong0);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, t6);
    			append_dev(div5, t7);
    			append_dev(div5, strong1);
    			append_dev(div5, t10);
    			append_dev(div5, div4);
    			append_dev(div4, t11);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, hr, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*comments*/ 16 && !src_url_equal(img.src, img_src_value = /*comment*/ ctx[11].author.avatar_url)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*comments*/ 16 && t1_value !== (t1_value = /*comment*/ ctx[11].author.username + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*comments*/ 16 && t6_value !== (t6_value = /*comment*/ ctx[11].createdAt + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*comments*/ 16 && t11_value !== (t11_value = /*comment*/ ctx[11].body + "")) set_data_dev(t11, t11_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(hr);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(123:8) {#each comments as comment}",
    		ctx
    	});

    	return block;
    }

    // (142:42) 
    function create_if_block_2(ctx) {
    	let form;
    	let strong;
    	let t2;
    	let textarea;
    	let t3;
    	let div1;
    	let div0;
    	let t4;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			strong = element("strong");
    			strong.textContent = `${Lang.get("new-comment")}:`;
    			t2 = space();
    			textarea = element("textarea");
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t4 = space();
    			button = element("button");
    			button.textContent = `${Lang.get("add")}`;
    			add_location(strong, file$2, 143, 16, 5163);
    			textarea.required = "required";
    			attr_dev(textarea, "class", "textarea mb2");
    			attr_dev(textarea, "rows", "4");
    			attr_dev(textarea, "placeholder", Lang.get("comment"));
    			add_location(textarea, file$2, 144, 16, 5224);
    			attr_dev(div0, "class", "spacer svelte-1bhjsnz");
    			add_location(div0, file$2, 152, 20, 5527);
    			attr_dev(button, "class", "btn");
    			attr_dev(button, "type", "submit");
    			add_location(button, file$2, 153, 20, 5571);
    			attr_dev(div1, "class", "flex mt1");
    			add_location(div1, file$2, 151, 16, 5483);
    			attr_dev(form, "class", "p1");
    			add_location(form, file$2, 142, 12, 5086);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, strong);
    			append_dev(form, t2);
    			append_dev(form, textarea);
    			set_input_value(textarea, /*data*/ ctx[3].body);
    			append_dev(form, t3);
    			append_dev(form, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t4);
    			append_dev(div1, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[8]),
    					listen_dev(form, "submit", prevent_default(/*handleOnSubmit*/ ctx[7]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*data*/ 8) {
    				set_input_value(textarea, /*data*/ ctx[3].body);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(142:42) ",
    		ctx
    	});

    	return block;
    }

    // (140:8) {#if working}
    function create_if_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "fas fa-spinner fa-spin fa-3x");
    			add_location(div, file$2, 140, 12, 4984);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(140:8) {#if working}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*loading*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Detail', slots, []);
    	let loading = true;
    	let working = false;
    	let task = {};
    	let user = null;
    	let data = { body: "", idIssue: 0, idProject: 0 };
    	let comments = [];
    	let notes = [];
    	let state = "";

    	function handleOnSubmit() {
    		$$invalidate(3, data.idProject = task.idProject, data);
    		$$invalidate(3, data.idIssue = task.id, data);
    		$$invalidate(1, working = true);

    		Command.send("comments/add", data, cc => {
    			$$invalidate(1, working = false);
    			$$invalidate(2, task.comments++, task);

    			//console.log('comments cc', cc);
    			const rs = comments.concat([cc]);

    			$$invalidate(4, comments = rs);
    			$$invalidate(3, data = {});
    		});
    	}

    	const load = () => {
    		setTimeout(() => $$invalidate(0, loading = false), 5000);

    		Command.send("task/load", dd => {
    			//console.log("webtask cargando task....", dd);
    			if (dd.id) State.set("task", dd); else dd = State.get("task", {});

    			$$invalidate(2, task = dd);

    			if (task.state === "closed") {
    				$$invalidate(6, state = Lang.get("closed-at") + "  " + task.closedAt);
    			} else {
    				$$invalidate(6, state = Lang.get("opened") + " - " + Lang.get("updated-at") + " " + task.updatedAt);
    			}

    			Command.send("comments/load", { idProject: task.project.id, id: task.id }, cc => {
    				//console.log('comments all', cc.comments);
    				$$invalidate(4, comments = cc.comments);

    				$$invalidate(5, notes = cc.notes);

    				//console.log("comentarios", cc);
    				$$invalidate(0, loading = false);
    			});
    		});
    	};

    	onMount(() => {
    		//console.log("webtask- loading", loading);
    		user = State.get("user");

    		load();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Detail> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		data.body = this.value;
    		$$invalidate(3, data);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		Command,
    		Lang,
    		State,
    		Spinner,
    		Progress,
    		loading,
    		working,
    		task,
    		user,
    		data,
    		comments,
    		notes,
    		state,
    		handleOnSubmit,
    		load
    	});

    	$$self.$inject_state = $$props => {
    		if ('loading' in $$props) $$invalidate(0, loading = $$props.loading);
    		if ('working' in $$props) $$invalidate(1, working = $$props.working);
    		if ('task' in $$props) $$invalidate(2, task = $$props.task);
    		if ('user' in $$props) user = $$props.user;
    		if ('data' in $$props) $$invalidate(3, data = $$props.data);
    		if ('comments' in $$props) $$invalidate(4, comments = $$props.comments);
    		if ('notes' in $$props) $$invalidate(5, notes = $$props.notes);
    		if ('state' in $$props) $$invalidate(6, state = $$props.state);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		loading,
    		working,
    		task,
    		data,
    		comments,
    		notes,
    		state,
    		handleOnSubmit,
    		textarea_input_handler
    	];
    }

    class Detail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Detail",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* webviews\App\Bye.svelte generated by Svelte v3.48.0 */
    const file$1 = "webviews\\App\\Bye.svelte";

    function create_fragment$1(ctx) {
    	let div3;
    	let span;
    	let t0;
    	let div0;
    	let strong;
    	let t2;
    	let div2;
    	let div1;
    	let t5;
    	let ul;
    	let li0;
    	let t8;
    	let li1;
    	let t11;
    	let li2;

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			span = element("span");
    			t0 = space();
    			div0 = element("div");
    			strong = element("strong");
    			strong.textContent = `${Lang.get("unknown-problem-occurred")}`;
    			t2 = space();
    			div2 = element("div");
    			div1 = element("div");
    			div1.textContent = `${Lang.get("alternatives")}:`;
    			t5 = space();
    			ul = element("ul");
    			li0 = element("li");
    			li0.textContent = `• ${Lang.get("please-refresh")}`;
    			t8 = space();
    			li1 = element("li");
    			li1.textContent = `• ${Lang.get("close-and-open")}`;
    			t11 = space();
    			li2 = element("li");
    			li2.textContent = `• ${Lang.get("sign-out-and-sign")}`;
    			attr_dev(span, "class", "dizzy svelte-1onqmly");
    			add_location(span, file$1, 5, 2, 72);
    			add_location(strong, file$1, 6, 7, 103);
    			add_location(div0, file$1, 6, 2, 98);
    			add_location(div1, file$1, 8, 4, 196);
    			add_location(li0, file$1, 10, 6, 252);
    			add_location(li1, file$1, 11, 6, 305);
    			add_location(li2, file$1, 12, 6, 358);
    			add_location(ul, file$1, 9, 4, 240);
    			attr_dev(div2, "class", "opts mt2 svelte-1onqmly");
    			add_location(div2, file$1, 7, 2, 168);
    			add_location(div3, file$1, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, span);
    			append_dev(div3, t0);
    			append_dev(div3, div0);
    			append_dev(div0, strong);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			append_dev(div2, t5);
    			append_dev(div2, ul);
    			append_dev(ul, li0);
    			append_dev(ul, t8);
    			append_dev(ul, li1);
    			append_dev(ul, t11);
    			append_dev(ul, li2);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bye', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bye> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Lang });
    	return [];
    }

    class Bye extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bye",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* webviews\App\Index.svelte generated by Svelte v3.48.0 */

    const { window: window_1 } = globals;
    const file = "webviews\\App\\Index.svelte";

    function create_fragment(ctx) {
    	let scrolling = false;

    	let clear_scrolling = () => {
    		scrolling = false;
    	};

    	let scrolling_timeout;
    	let div;
    	let switch_instance;
    	let current;
    	let mounted;
    	let dispose;
    	add_render_callback(/*onwindowscroll*/ ctx[3]);
    	var switch_value = /*current*/ ctx[1];

    	function switch_props(ctx) {
    		return { $$inline: true };
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			attr_dev(div, "class", "anemona-app svelte-1jva4ke");
    			add_location(div, file, 100, 0, 2867);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (switch_instance) {
    				mount_component(switch_instance, div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(window_1, "scroll", /*saveScroller*/ ctx[2], false, false, false),
    					listen_dev(window_1, "scroll", () => {
    						scrolling = true;
    						clearTimeout(scrolling_timeout);
    						scrolling_timeout = setTimeout(clear_scrolling, 100);
    						/*onwindowscroll*/ ctx[3]();
    					})
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*yScroll*/ 1 && !scrolling) {
    				scrolling = true;
    				clearTimeout(scrolling_timeout);
    				scrollTo(window_1.pageXOffset, /*yScroll*/ ctx[0]);
    				scrolling_timeout = setTimeout(clear_scrolling, 100);
    			}

    			if (switch_value !== (switch_value = /*current*/ ctx[1])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, div, null);
    				} else {
    					switch_instance = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (switch_instance) destroy_component(switch_instance);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Index', slots, []);
    	let vType = "sidebar";
    	let yScroll = 0;
    	let current = Spinner;
    	let idCurrent = "spinner";
    	let webTask = { "web-task": Detail };

    	let pages = {
    		tasks: Tasks,
    		dash: Dash,
    		login: Login,
    		logout: Logout
    	};

    	function saveScroller() {
    		$$invalidate(0, yScroll = yScroll
    		? yScroll
    		: State.get("scroll_" + idCurrent, 0.01));

    		State.set("scroll_" + idCurrent, yScroll);
    	}

    	const setComponet = componet => {
    		$$invalidate(1, current = componet);
    	};

    	const onPage = (cmd, dat) => {
    		//console.log("onPage", cmd, dat);
    		setComponet(Spinner);

    		idCurrent = cmd.shift();
    		let pag = {};
    		if (vType === "web-task") pag = webTask; else pag = pages;

    		if (idCurrent) {
    			if (idCurrent.indexOf("list-data") > -1) idCurrent = "tasks"; //parch

    			//console.log("component:", vType, idCurrent);
    			if (pag[idCurrent] && idCurrent !== "closed") Page.set(idCurrent); else return setComponet(Bye);

    			return setComponet(pag[idCurrent]);
    		}

    		setComponet(Bye);
    	}; //console.log("not component:", vType, idCurrent);

    	const addCommandListener = () => {
    		window.addEventListener("message", async event => {
    			const rd = event.data || {};

    			//console.log("received message:", rd);
    			if (Command.call(rd)) return;

    			const cmd = rd.cmd.split("/");

    			//console.log('command',cmd);
    			switch (cmd.shift()) {
    				case "reloads":
    					Command.send("reloads");
    					return start();
    				case "reload":
    					return start();
    				case "lang":
    					return Lang.load(rd.dat);
    				case "loading":
    					return setComponet(Spinner);
    			}

    			onPage(cmd);
    		});
    	};

    	const refresh = () => {
    		//State.set("tasks", undefined);
    		State.set("statistics", undefined);
    	};

    	const start = () => {
    		setComponet(Spinner);
    		Session.auth(vType);
    	};

    	const onRunner = cmd => {
    		switch (cmd) {
    			case "refresh":
    				return refresh();
    		}
    	};

    	onMount(() => {
    		vType = document.body.id;

    		//console.log("body type:", vType);
    		Page.addEventListener(page => onPage([page]));

    		State.addEventListener(cmd => onRunner(cmd));
    		addCommandListener();
    		start();
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Index> was created with unknown prop '${key}'`);
    	});

    	function onwindowscroll() {
    		$$invalidate(0, yScroll = window_1.pageYOffset);
    	}

    	$$self.$capture_state = () => ({
    		Spinner,
    		Login,
    		Logout,
    		Dash,
    		Tasks,
    		Page,
    		Lang,
    		Command,
    		Session,
    		State,
    		Detail,
    		Bye,
    		onMount,
    		vType,
    		yScroll,
    		current,
    		idCurrent,
    		webTask,
    		pages,
    		saveScroller,
    		setComponet,
    		onPage,
    		addCommandListener,
    		refresh,
    		start,
    		onRunner
    	});

    	$$self.$inject_state = $$props => {
    		if ('vType' in $$props) vType = $$props.vType;
    		if ('yScroll' in $$props) $$invalidate(0, yScroll = $$props.yScroll);
    		if ('current' in $$props) $$invalidate(1, current = $$props.current);
    		if ('idCurrent' in $$props) idCurrent = $$props.idCurrent;
    		if ('webTask' in $$props) webTask = $$props.webTask;
    		if ('pages' in $$props) pages = $$props.pages;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [yScroll, current, saveScroller, onwindowscroll];
    }

    class Index extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Index",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new Index({
      target: document.body,
    });

    return app;

})();
