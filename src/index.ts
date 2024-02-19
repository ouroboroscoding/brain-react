/**
 * Myself
 *
 * Handles managing the currently signed in user and their permissions
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-03-06
 */

// Ouroboros modules
import body, { responseErrorStruct } from '@ouroboros/body';
import brain, { RIGHTS_ALL_ID } from '@ouroboros/brain';
import clone from '@ouroboros/clone';

// NPM modules
import { useEffect, useState } from 'react';

// Types
export type permissionsCallback = (permissions: Record<string, rightsStruct>) => void;
export type permissionSubscribeReturn = {
	data: Record<string, Record<string, rightsStruct>> |
			Record<string, rightsStruct> |
			rightsStruct;
	unsubscribe: () => void
}
export type rightOption = 'create' | 'delete' | 'read' | 'update';
export type rightStruct = Record<string, number>
export type rightsCallback = (rights: rightsStruct) => void;
export type rightsStruct = Record<string, {
	create?: true,
	delete?: true,
	read?: true,
	update?: true
}>
export type signinStruct = {
	email: string,
	passwd: string,
	portal?: string
}
export type signinReturn = {
	session: string,
	user: userType
}
export type signupStruct = {
	email: string,
	first_name?: string,
	'g-recaptcha-response': string,
	last_name?: string,
	locale?: string,
	phone_ext?: string,
	phone_number?: string,
	portal?: string,
	suffix?: string,
	title?: string,
	url: string
}
export type subscribeReturn = {
	data: userType,
	unsubscribe: () => void
}
export type userCallback = (user: userType) => void;
export type userType = {
	_id: string,
	permissions: Record<string, rightStruct>,
	[x: string]: any
}

// Rights types
const _types: Record<rightOption, number> = {
	create:	0x01,
	read:	0x02,
	update:	0x04,
	delete:	0x08
}

// Module values
//	Users
let _user: userType | false = false;
const _userSubscriptions: ((user: userType) => void)[] = [];
// Permissions
let _permissions: Record<string, rightsStruct> = {};
const _permissionsSubscriptions: permissionsCallback[] = [];
// Rights
const _rightsSubscriptions: Record<string, rightsCallback[]> = {};
// Rights all
const _rightsAllSubscriptions: Record<string, rightsCallback[]> = {};
// Callbacks
let _noSession: () => void;

// Trap no session errors
body.onNoSession(() => {
	brain.session(null as unknown as string);
	set(false);
	permissionsSet({});
	if(_noSession !== undefined) {
		_noSession();
	}
});

/**
 * On No Session
 *
 * Sets the callback called if any request fails the session
 *
 * @name onNoSession
 * @access public
 * @param callback The function to call if there are session errors
 */
export function onNoSession(callback: () => void): void {

	// Make sure the callback is function
	if(typeof callback !== 'function') {
		throw new Error('onNoSession() called with an invalid callback');
	}

	// Set the callback
	_noSession = callback;
}

/**
 * Permissions Subscribe
 *
 * Subscribes a callback to all permissions or a specific one
 *
 * @name permissionsSubscribe
 * @access public
 * @param callback The callback to subscribe
 * @param name Optional, the specific permission to subscribe to,
 * @param id Optional, the specific ID to subscribe to on the permission
 */
export function permissionsSubscribe(
	callback: permissionsCallback | rightsCallback,
	name?: string,
	id?: string
): permissionSubscribeReturn {

	// If we have no specific permission
	if(name === undefined) {

		// Just add it to the list
		_permissionsSubscriptions.push(callback as permissionsCallback);

		// Clone the current permissions
		const oPermissions = clone(_permissions);

		// Call the callback with the current data
		callback(oPermissions)

		// Return the current data and an unsubscribe function
		return {
			data: oPermissions,
			unsubscribe: () => {
				permissionsUnsubscribe(callback);
			}
		}
	}
	// Else, we have a specific permission
	else {

		// If we have no ID
		if(id === undefined) {

			// If we don't have this permission yet
			if(!(name in _rightsAllSubscriptions)) {
				_rightsAllSubscriptions[name] = [];
			}

			// Add the callback
			_rightsSubscriptions[name].push(callback as rightsCallback);

			// Get the rights
			const oRights = name in _permissions ?
							clone(_permissions[name]) :
							{ };

			// Call the callback with the current data
			callback(oRights);

			// Return the current data and an unsubscribe function
			return {
				data: oRights,
				unsubscribe: () => {
					permissionsUnsubscribe(callback, name);
				}
			}
		}

		// Else, we are looking for a specific ID
		else {

			// Generate the full key
			const sKey = `${name}:${id}`;

			// If we don't have this permission yet
			if(!(sKey in _rightsSubscriptions)) {
				_rightsSubscriptions[sKey] = [];
			}

			// Add the callback
			_rightsSubscriptions[sKey].push(callback as rightsCallback);

			// Get the rights
			const oRights = (name in _permissions && id in _permissions[name]) ?
							clone(_permissions[name][id]) :
							{ };

			// Call the callback with the current data
			callback(oRights);

			// Return the current data and an unsubscribe function
			return {
				data: oRights,
				unsubscribe: () => {
					permissionsUnsubscribe(callback, name, id);
				}
			}
		}
	}
}

/**
 * Permissions Unsubscribe
 *
 * Unsubscribes a callback from all permissions or a specific one
 *
 * @name permissionsUnsubscribe
 * @access public
 * @param callback The callback to unsubscribe
 * @param name Optional, the specific permission to unsubscribe from
 * @param id Optional, the specific ID on the permission to unsubscribe from
 * @returns true if the callback was found and removed
 */
export function permissionsUnsubscribe(
	callback: permissionsCallback | rightsCallback,
	name?: string,
	id?: string
): boolean {

	// If we have no specific permission
	if(name === undefined) {

		// Find the callback
		const i = _permissionsSubscriptions.indexOf(
			callback as permissionsCallback
		);

		// If we found it
		if(i > -1) {

			// Splice it out and return that we did so
			_permissionsSubscriptions.splice(i, 1);
			return true;
		}

		// Not found
		return false;
	}

	// Else, we have a specific permission
	else {

		// Figure out the ID
		const sID = id === undefined ? RIGHTS_ALL_ID : id;

		// Add the ID to the name
		const sKey = `${name}:${sID}`;

		// If we don't have any callbacks for the permission
		if(!(sKey in _rightsSubscriptions)) {
			return false;
		}

		// Find the callback
		const i = _rightsSubscriptions[sKey].indexOf(
			callback as rightsCallback
		);

		// If we found it
		if(i > -1) {

			// Splice it out
			_rightsSubscriptions[sKey].splice(i, 1);

			// If we no longer have any callbacks, remove the permission
			if(_rightsSubscriptions[sKey].length <= 0) {
				delete _rightsSubscriptions[sKey];
			}

			// Return found and remove
			return true;
		}

		// Not found
		return false;
	}
}

/**
 * Permissions Set
 *
 * Sets the new permissions
 *
 * @name permissionsSet
 * @access public
 * @param permissions The new list of permissions from the user
 */
function permissionsSet(list: Record<string, rightStruct>): void {

	// Reset the point to the list by re-initialising it
	_permissions = {}

	// Go through each permission
	for(const name of Object.keys(list)) {

		// Initialise the IDs
		_permissions[name] = { };

		// Go through each ID
		for(const id of (Object.keys(list[name]))) {

			// Initialise the permission rights to none
			_permissions[name][id] = { };

			// Go through each right
			for(const s of (Object.keys(_types) as rightOption[])) {

				// If it exists on the permission
				if(list[name][id] & _types[s]) {

					// Set it to true
					_permissions[name][id][s] = true;
				}
			}
		}
	}

	// Go through all callbacks for all permissions
	for(const f of _permissionsSubscriptions) {

		// Pass a copy of all permissions to it
		f(clone(_permissions));
	}

	// Go through all names of permissions in the rights callbacks
	for(const k of Object.keys(_rightsSubscriptions)) {

		// Go through each callback
		for(const f of _rightsSubscriptions[k]) {

			// Split the key into name and ID
			const [name, id] = k.split(':')

			// Pass a copy of the rights to it if we find any, else just an
			//	empty object
			f((name in _permissions && id in _permissions[name]) ?
				clone(_permissions[name][id]) :
				{}
			);
		}
	}
}

/**
 * Set
 *
 * Sets the new user and fires off notifications to all subscriptions
 *
 * @name set
 * @access private
 * @param user The user data or false
 */
function set(user: userType | false) {

	// Set the new user
	_user = user;

	// Go through all subscriptions
	for(const f of _userSubscriptions) {
		f(clone(_user));
	}
}

/**
 * Sign In
 *
 * Called to sign into a user account
 *
 * @name signin
 * @access public
 * @param using A session token, or the email/passwd to log in
 */
export function	signin(using: string | signinStruct): Promise<signinReturn> {

	// Create a new Promise and return it
	return new Promise((resolve, reject) => {

		// If we got session token
		if(typeof using === 'string') {

			// Set the session
			brain.session(using);

			// Fetch the user associated
			update().then(user => {
				resolve({
					session: using,
					user
				})
			});
		}

		// Else, if we got an email and password
		else {

			// Attempt to signin
			brain.create('signin', using).then((data: signinReturn) => {

				// If we were successful
				if(data) {

					// Set the session
					brain.session(data.session);

					// Fetch the current user
					update().then(user => {

						// Resolve with the session and user
						resolve({
							session: data.session,
							user
						});
					});
				}
			}, reject);
		}
	});
}

/**
 * Sign Out
 *
 * Called to sign out the current user
 *
 * @name signout
 * @access public
 */
export function signout(): Promise<boolean> {

	// Create a new Promise and return it
	return new Promise((resolve, reject) => {

		// Call the sign out request
		brain.create('signout').then((data: boolean) => {
			if(data) {
				brain.session(null as unknown as string);
				set(false);
				permissionsSet({});
			}
			resolve(data);
		}, reject);
	});
}

/**
 * Sign Up
 *
 * Called to sign up a new user account
 *
 * @name signup
 * @access public
 * @param using A session token, or the email/passwd to log in
 */
export function	signup(using: signupStruct): Promise<boolean> {

	// Create a new Promise and return it
	return new Promise((resolve, reject) => {

		// Attempt to signin
		brain.create('signup', using).then(resolve, reject);
	});
}

/**
 * Subscribe
 *
 * Subscribes a callback to signed in user updates
 *
 * @name subscribe
 * @access public
 * @param callback The callback to subscribe
 */
export function subscribe(callback: userCallback): subscribeReturn {

	// Add it to the list
	_userSubscriptions.push(callback);

	// Clone the user
	const oUser = clone(_user);

	// Call the callback with the current data
	callback(oUser);

	// Return the current data and an unsubscribe function
	return {
		data: oUser,
		unsubscribe: () => {
			unsubscribe(callback);
		}
	}
}

/**
 * Unsubscribe
 *
 * Unsubscribes a callback from getting signed in user updates
 *
 * @name unsubscribe
 * @access public
 * @param callback The callback to unsubscribe
 * @param permission Optional, the specific permission to unsubscribe from
 * @returns true if the callback was found and removed
 */
export function unsubscribe(callback: userCallback): boolean {

	// Find the callback
	const i = _userSubscriptions.indexOf(callback);

	// If we found it
	if(i > -1) {

		// Splice it out and return that we did so
		_userSubscriptions.splice(i, 1);
		return true;
	}

	// Not found
	return false;
}

/**
 * Update
 *
 * Gets the latest data from the server
 *
 * @name update
 * @access public
 * @param user Optional, the user data to set from
 */
export function update(): Promise<userType> {

	// Create a new Promise and return it
	return new Promise((resolve, reject) => {

		// Fetch the user using the session
		brain.read('user').then((data: userType) => {

			// If we got the user
			if(data) {

				// Set the current user
				set(data);

				// Update the permissions
				permissionsSet(data.permissions || {});

				// Resolve with the user data
				resolve(data);
			}

		}, (error: responseErrorStruct) => {
			if(error.handle) {
				error.handle(JSON.stringify({ code: error.code, msg: error.msg }));
			} else {
				reject(error);
			}
		});
	});
}

/**
 * Use Permissions
 *
 * A react hook to keep track of what rights a user has
 *
 * @name usePermissions
 * @access public
 * @returns the rights associated with all permissions
 */
export function usePermissions(): Record<string, rightsStruct> {

	// Store the state
	const [perms, permsSet] = useState<Record<string, rightsStruct>>({});

	// Load effect, subscribe to permissions changes
	useEffect(() => {
		const o = permissionsSubscribe(permsSet);
		return () => o.unsubscribe();
	}, []);

	// Return the current value
	return perms;
}

/**
 * Use Rights
 *
 * A react hook to keep track of what rights a user has under a specific ID
 *
 * @name useRights
 * @access public
 * @param permission The name of the permission to track
 * @param id? Tbe specific ID to return
 * @returns the rights associated with the permission
 */
export function useRights(
	permission: string,
	id: string = '*'
): rightsStruct {

	// Store the state
	const [rights, rightsSet] = useState<rightsStruct>({ });

	// Load effect, subscribe to specific permission changes
	useEffect(() => {
		const o = permissionsSubscribe(
			rightsSet,
			permission,
			id === '*' ? RIGHTS_ALL_ID : id
		);
		return () => o.unsubscribe();
	}, [permission, id]);

	// Return the current value
	return rights;
}

/**
 * Use Rights All
 *
 * A react hook to keep track of what rights a user has for all IDs under a name
 *
 * @name useRightsAll
 * @access public
 * @param permission The name of the permission to track
 * @returns the rights associated with the permission for each ID available
 */
export function useRightsAll(
	permission: string
): Record<string, rightsStruct> {

	// Store the results
	const [rights, rightsSet] = useState<Record<string, rightsStruct>>({ });

	// Load effect, subscribe to specific permission changes
	useEffect(() => {
		const o = permissionsSubscribe(
			rightsSet,
			permission
		);
		return () => o.unsubscribe();
	}, [permission]);

	// Return the current value
	return rights;
}

/**
 * Use User
 *
 * A hook to get the currently logged in user
 *
 * @name useUser
 * @access public
 * @returns the currently logged in user
 */
export function useUser() {

	// State
	const [user, userSet] = useState<userType | false>(false);

	// Load effect, subscribe to user changes
	useEffect(() => {
		const o = subscribe(userSet);
		return () => o.unsubscribe();
	}, []);

	// Return current user
	return user;
}