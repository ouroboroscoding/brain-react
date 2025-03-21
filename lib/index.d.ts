/**
 * Brain React
 *
 * Handles managing the currently signed in user and their permissions
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-03-06
 */
export type idStruct = {
    create?: true;
    delete?: true;
    read?: true;
    update?: true;
};
export type permissionsCallback = (permissions: Record<string, rightsStruct>) => void;
export type permissionSubscribeReturn = {
    data: Record<string, Record<string, rightsStruct>> | Record<string, rightsStruct> | rightsStruct;
    unsubscribe: () => void;
};
export type permissionsStruct = Record<string, rightsStruct>;
export type rightOption = 'create' | 'delete' | 'read' | 'update';
export type rightStruct = Record<string, number>;
export type rightsCallback = (rights: rightsStruct) => void;
export type rightsStruct = Record<string, idStruct>;
export type signinStruct = {
    email: string;
    passwd: string;
    portal?: string;
};
export type signinReturn = {
    session: string;
    user: userType;
};
export type signupStruct = {
    email: string;
    first_name?: string;
    'g-recaptcha-response': string;
    last_name?: string;
    locale?: string;
    phone_ext?: string;
    phone_number?: string;
    portal?: string;
    suffix?: string;
    title?: string;
    url: string;
};
export type subscribeReturn = {
    data: userType;
    unsubscribe: () => void;
};
export type userCallback = (user: userType) => void;
export type userType = {
    _id: string;
    permissions: Record<string, rightStruct>;
    [x: string]: any;
};
/**
 * On No Session
 *
 * Sets the callback called if any request fails the session
 *
 * @name onNoSession
 * @access public
 * @param callback The function to call if there are session errors
 */
export declare function onNoSession(callback: () => void): void;
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
export declare function permissionsSubscribe(callback: permissionsCallback | rightsCallback, name?: string, id?: string): permissionSubscribeReturn;
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
export declare function permissionsUnsubscribe(callback: permissionsCallback | rightsCallback, name?: string, id?: string): boolean;
/**
 * Sign In
 *
 * Called to sign into a user account
 *
 * @name signin
 * @access public
 * @param using A session token, or the email/passwd to log in
 */
export declare function signin(using: string | signinStruct): Promise<signinReturn>;
/**
 * Sign Out
 *
 * Called to sign out the current user
 *
 * @name signout
 * @access public
 */
export declare function signout(): Promise<boolean>;
/**
 * Sign Up
 *
 * Called to sign up a new user account
 *
 * @name signup
 * @access public
 * @param using A session token, or the email/passwd to log in
 */
export declare function signup(using: signupStruct): Promise<boolean>;
/**
 * Subscribe
 *
 * Subscribes a callback to signed in user updates
 *
 * @name subscribe
 * @access public
 * @param callback The callback to subscribe
 */
export declare function subscribe(callback: userCallback): subscribeReturn;
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
export declare function unsubscribe(callback: userCallback): boolean;
/**
 * Update
 *
 * Gets the latest data from the server
 *
 * @name update
 * @access public
 * @returns Promise
 */
export declare function update(): Promise<userType>;
/**
 * Use Permissions
 *
 * A react hook to keep track of what rights a user has
 *
 * @name usePermissions
 * @access public
 * @returns the rights associated with all permissions
 */
export declare function usePermissions(): permissionsStruct;
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
export declare function useRights(permission: string, id?: string): idStruct;
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
export declare function useRightsAll(permission: string): rightsStruct;
/**
 * Use User
 *
 * A hook to get the currently logged in user
 *
 * @name useUser
 * @access public
 * @returns the currently logged in user
 */
export declare function useUser(): false | userType;
