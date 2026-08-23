import * as H5P from '@lumieducation/h5p-server';
import { IContentMetadata, IUser } from '@lumieducation/h5p-server';

/**
 * Create a minimal H5PEditor object backed by the local filesystem. This is
 * a trimmed-down version of the createH5PEditor helper used in
 * h5p-nodejs-library's h5p-rest-example-server, kept simple on purpose since
 * this example only exists to demonstrate SharedStateServer.
 * @param config the configuration object
 * @param localLibraryPath a path in the local filesystem in which the H5P libraries (content types) are stored
 * @param localContentPath a path in the local filesystem in which H5P content will be stored
 * @param localTemporaryPath a path in the local filesystem in which temporary files will be stored
 * @param translationCallback a function that is called to retrieve translations of keys in a certain language
 * @returns a H5PEditor object
 */
export default async function createH5PEditor(
    config: H5P.IH5PConfig,
    permissionSystem: H5P.IPermissionSystem,
    localLibraryPath: string,
    localContentPath: string,
    localTemporaryPath: string,
    localContentUserDataPath: string,
    translationCallback: H5P.ITranslationFunction,
    hooks?: {
        contentWasDeleted?: (contentId: string, user: IUser) => Promise<void>;
        contentWasUpdated?: (
            contentId: string,
            metadata: IContentMetadata,
            parameters: any,
            user: IUser
        ) => Promise<void>;
        contentWasCreated?: (
            contentId: string,
            metadata: IContentMetadata,
            parameters: any,
            user: IUser
        ) => Promise<void>;
    }
): Promise<H5P.H5PEditor> {
    const contentUserDataStorage =
        new H5P.fsImplementations.FileContentUserDataStorage(
            localContentUserDataPath
        );

    return new H5P.H5PEditor(
        new H5P.cacheImplementations.CachedKeyValueStorage(
            'kvcache',
            undefined
        ),
        config,
        new H5P.fsImplementations.FileLibraryStorage(localLibraryPath),
        new H5P.fsImplementations.FileContentStorage(localContentPath),
        new H5P.fsImplementations.DirectoryTemporaryFileStorage(
            localTemporaryPath
        ),
        translationCallback,
        undefined,
        {
            enableHubLocalization: true,
            enableLibraryNameLocalization: true,
            hooks,
            permissionSystem
        },
        contentUserDataStorage
    );
}
