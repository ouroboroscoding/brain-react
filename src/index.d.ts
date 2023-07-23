/**
 * Myself
 *
 * Handles managing the currently signed in user and their permissions
 *
 * @author Chris Nasr <chris@ouroboroscoding.com>
 * @copyright Ouroboros Coding Inc.
 * @created 2023-03-06
 */
export type rightsStruct = {
    create?: true;
    delete?: true;
    read?: true;
    update?: true;
};
export type permissionsCallback = (permissions: Record<string, rightsStruct>) => void;
export type permissionSubscribeReturn = {
    data: Record<string, rightsStruct> | rightsStruct;
    unsubscribe: () => void;
};
export type rightOption = 'create' | 'delete' | 'read' | 'update';
export type rightsCallback = (rights: rightsStruct) => void;
export type signinStruct = {
    email: string;
    passwd: string;
};
export type signinReturn = {
    session: string;
    user: userType;
};
export type subscribeReturn = {
    data: userType;
    unsubscribe: () => void;
};
export type userCallback = (user: userType) => void;
export type userType = {
    _id: string;
    permissions: Record<string, number>;
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
 * @param permission Optional, the specific permission to subscribe to
 */
export declare function permissionsSubscribe(callback: permissionsCallback | rightsCallback, permission?: string): permissionSubscribeReturn;
/**
 * Permissions Unsubscribe
 *
 * Unsubscribes a callback from all permissions or a specific one
 *
 * @name permissionsUnsubscribe
 * @access public
 * @param callback The callback to unsubscribe
 * @param permission Optional, the specific permission to unsubscribe from
 * @returns true if the callback was found and removed
 */
export declare function permissionsUnsubscribe(callback: permissionsCallback | rightsCallback, permission?: string): boolean;
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
 * Sets the passed data, or gets the latest from the server
 *
 * @name update
 * @access public
 * @param user Optional, the user data to set from
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
export declare function usePermissions(): Record<string, rightsStruct>;
/**
 * Use Rights
 *
 * A react hook to keep track of what rights a user has
 *
 * @name useRights
 * @access public
 * @param permission The name of the permission to track
 * @returns the rights associated with the permission
 */
export declare function useRights(permission: string): rightsStruct;
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
