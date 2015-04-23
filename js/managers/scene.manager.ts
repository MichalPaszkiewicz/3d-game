module App.Manager.Scene {

    var sceneItems: App.Scene.SceneItem[] = [];

    export function AddSceneItem(item: App.Scene.SceneItem) {
        sceneItems.push(item);
    }

}