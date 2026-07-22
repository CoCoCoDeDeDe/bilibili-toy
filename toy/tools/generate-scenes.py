"""Generate Cocos Creator 3.8 scene files with UUIDs."""
import uuid
import json
import os
import shutil

def gen_uuid():
    """Generate a Cocos Creator compatible UUID (8-4-4-4-12)."""
    return str(uuid.uuid4())

def gen_short_uuid():
    """Generate a short UUID format used by Cocos Creator."""
    return base64_uuid()

def base64_uuid():
    """Generate a base64-like short UUID (Cocos style)."""
    b = uuid.uuid4().bytes
    # Use base64url encoding without padding
    import base64
    return base64.urlsafe_b64encode(b).decode('ascii').rstrip('=')

def make_vec3(x, y, z):
    return {"__type__": "cc.Vec3", "x": x, "y": y, "z": z}

def make_quat(x, y, z, w):
    return {"__type__": "cc.Quat", "x": x, "y": y, "z": z, "w": w}

def make_color(r, g, b, a=255):
    return {"__type__": "cc.Color", "r": r, "g": g, "b": b, "a": a}

def make_ref(id_idx):
    return {"__id__": id_idx}

def build_scene(nodes, components, extras=None):
    """Build a complete scene asset array."""
    scene_id = 1  # Scene object will be at index 1
    scene_asset = {
        "__type__": "cc.SceneAsset",
        "_name": "scene",
        "_objFlags": 0,
        "__editorExtras__": extras or {},
        "_native": "",
        "scene": make_ref(scene_id)
    }
    
    result = [scene_asset]
    result.extend(nodes)
    result.extend(components)
    return result


class SceneBuilder:
    """Helper to build Cocos Creator scene JSON."""
    
    def __init__(self, name="scene"):
        self.objects = []
        self.node_ids = {}   # name -> index in objects
        self._scene_idx = None
        self._init_scene(name)
    
    def _next_idx(self):
        return len(self.objects)
    
    def _init_scene(self, name):
        # SceneAsset at index 0
        scene_asset = {
            "__type__": "cc.SceneAsset",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_native": "",
            "scene": {"__id__": 1}
        }
        self.objects.append(scene_asset)
        self._scene_idx = self._next_idx()
        
        # Scene node at index 1
        scene_node = {
            "__type__": "cc.Scene",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_parent": None,
            "_children": [],
            "_active": True,
            "_components": [],
            "_prefab": None,
            "_lpos": make_vec3(0, 0, 0),
            "_lrot": make_quat(0, 0, 0, 1),
            "_lscale": make_vec3(1, 1, 1),
            "_mobility": 0,
            "_layer": 1073741824,
            "_euler": make_vec3(0, 0, 0),
            "autoReleaseAssets": False,
            "_globals": None,
            "_id": gen_uuid()
        }
        self.objects.append(scene_node)
        self.node_ids[name] = self._scene_idx
    
    def add_node(self, name, parent_name=None, pos=None, rot=None, scale=None, 
                 active=True, layer=1073741824):
        """Add a node and return its index."""
        idx = self._next_idx()
        self.node_ids[name] = idx
        
        parent_idx = self.node_ids.get(parent_name, self._scene_idx) if parent_name else self._scene_idx
        
        node = {
            "__type__": "cc.Node",
            "_name": name,
            "_objFlags": 0,
            "__editorExtras__": {},
            "_parent": make_ref(parent_idx),
            "_children": [],
            "_active": active,
            "_components": [],
            "_prefab": None,
            "_lpos": pos or make_vec3(0, 0, 0),
            "_lrot": rot or make_quat(0, 0, 0, 1),
            "_lscale": scale or make_vec3(1, 1, 1),
            "_mobility": 0,
            "_layer": layer,
            "_euler": make_vec3(0, 0, 0),
            "_id": gen_uuid()
        }
        self.objects.append(node)
        
        # Add as child to parent
        parent_obj = self.objects[parent_idx]
        if parent_obj.get("_children") is not None:
            parent_obj["_children"].append(make_ref(idx))
        
        return idx
    
    def add_component(self, comp_type, node_name, props=None, extra=None):
        """Add a component to a node."""
        idx = self._next_idx()
        node_idx = self.node_ids[node_name]
        
        comp = {
            "__type__": comp_type,
            "_name": "",
            "_objFlags": 0,
            "node": make_ref(node_idx),
            "_enabled": True,
            "__prefab": None,
            **(extra or {})
        }
        if props:
            comp.update(props)
        
        self.objects.append(comp)
        
        # Register on node
        node_obj = self.objects[node_idx]
        node_obj["_components"].append(make_ref(idx))
        
        return idx
    
    def to_json(self):
        return json.dumps(self.objects, indent=2, ensure_ascii=False)


def create_start_scene():
    """Create StartScene with UI elements."""
    sb = SceneBuilder("StartScene")
    
    # Canvas node
    canvas_idx = sb.add_node("Canvas", "StartScene", 
                            layer=1073741824)
    
    # Background
    bg_idx = sb.add_node("Background", "Canvas", 
                        layer=1073741824)
    
    # Title
    title_idx = sb.add_node("Title", "Canvas",
                           pos=make_vec3(0, 200, 0),
                           layer=1073741824)
    
    # Start button
    start_btn_idx = sb.add_node("StartButton", "Canvas",
                               pos=make_vec3(0, 50, 0),
                               layer=1073741824)
    
    # Start button label
    start_label_idx = sb.add_node("Label", "StartButton",
                                 layer=1073741824)
    
    # Settings button
    settings_btn_idx = sb.add_node("SettingsButton", "Canvas",
                                  pos=make_vec3(0, -50, 0),
                                  layer=1073741824)
    
    # Settings button label
    settings_label_idx = sb.add_node("Label", "SettingsButton",
                                    layer=1073741824)
    
    # Version label
    version_idx = sb.add_node("VersionLabel", "Canvas",
                             pos=make_vec3(0, -300, 0),
                             layer=1073741824)
    
    # ---- Components ----
    # Canvas component
    sb.add_component("cc.Canvas", "Canvas", extra={
        "_renderMode": 0,
        "_designResolution": {"__type__": "cc.Size", "width": 1920, "height": 1080},
        "_fitToWidth": True,
        "_fitToHeight": True,
    })
    
    # Canvas widget
    sb.add_component("cc.Widget", "Canvas", extra={
        "_alignFlags": 47,
        "_isAbsLeft": True, "_left": 0,
        "_isAbsRight": True, "_right": 0,
        "_isAbsTop": True, "_top": 0,
        "_isAbsBottom": True, "_bottom": 0,
    })
    
    # Sprite components
    bg_sprite_idx = sb.add_component("cc.Sprite", "Background", extra={
        "_color": make_color(255, 245, 230, 255),
        "_sizeMode": 1,
        "_type": 0,
        "_fillType": 0,
        "_fillCenter": make_vec3(0, 0, 0),
        "_fillStart": 0,
        "_fillRange": 0,
        "_srcBlendFactor": 2,
        "_dstBlendFactor": 4,
    })
    
    # Background widget
    sb.add_component("cc.Widget", "Background", extra={
        "_alignFlags": 47,
        "_isAbsLeft": True, "_left": 0,
        "_isAbsRight": True, "_right": 0,
        "_isAbsTop": True, "_top": 0,
        "_isAbsBottom": True, "_bottom": 0,
    })
    
    # Title label
    title_label_idx = sb.add_component("cc.Label", "Title", extra={
        "_string": "逃离鸭科夫",
        "_fontSize": 48,
        "_lineHeight": 56,
        "_color": make_color(74, 55, 40, 255),
        "_isSystemFontUsed": True,
        "_spacingX": 0,
        "_overflow": 0,
        "_enableWrapText": True,
        "_isItalic": False,
        "_isBold": True,
        "_underline": False,
        "_underlineHeight": 0,
    })
    
    # Title widget
    sb.add_component("cc.Widget", "Title", extra={
        "_alignFlags": 12,
        "_isAbsHorizontal": True, "_horizontalCenter": 0,
        "_isAbsTop": True, "_top": 150,
    })
    
    # Start button component
    sb.add_component("cc.Button", "StartButton", extra={
        "_interactable": True,
        "_transition": 1,  # COLOR
        "_normalColor": make_color(245, 166, 35, 255),
        "_pressedColor": make_color(224, 149, 0, 255),
        "_hoverColor": make_color(255, 184, 77, 255),
        "_disabledColor": make_color(200, 200, 200, 128),
        "_duration": 0.1,
        "_zoomScale": 1.0,
    })
    
    # Start button sprite (for background)
    sb.add_component("cc.Sprite", "StartButton", extra={
        "_sizeMode": 1,
        "_type": 0,
        "_color": make_color(245, 166, 35, 255),
    })
    
    # Start button widget
    sb.add_component("cc.Widget", "StartButton", extra={
        "_alignFlags": 12,
        "_isAbsHorizontal": True, "_horizontalCenter": 0,
        "_isAbsTop": True, "_top": 280,
    })
    
    # Start button label
    sb.add_component("cc.Label", "Label", extra={
        "_string": "开始游戏",
        "_fontSize": 24,
        "_lineHeight": 32,
        "_color": make_color(255, 255, 255, 255),
        "_isSystemFontUsed": True,
        "_isBold": True,
    })
    
    # Settings button
    sb.add_component("cc.Button", "SettingsButton", extra={
        "_interactable": True,
        "_transition": 2,  # SPRITE
        "_normalColor": make_color(255, 255, 255, 255),
        "_pressedColor": make_color(200, 200, 200, 255),
        "_hoverColor": make_color(230, 230, 230, 255),
    })
    
    # Settings button sprite
    sb.add_component("cc.Sprite", "SettingsButton", extra={
        "_sizeMode": 1,
        "_type": 0,
        "_color": make_color(245, 166, 35, 255),
    })
    
    # Settings button widget
    sb.add_component("cc.Widget", "SettingsButton", extra={
        "_alignFlags": 12,
        "_isAbsHorizontal": True, "_horizontalCenter": 0,
        "_isAbsTop": True, "_top": 380,
    })
    
    # Settings button label
    sb.add_component("cc.Label", "Label", extra={
        "_string": "设 置",
        "_fontSize": 24,
        "_lineHeight": 32,
        "_color": make_color(255, 255, 255, 255),
        "_isSystemFontUsed": True,
        "_isBold": True,
    })
    
    # Version label
    sb.add_component("cc.Label", "VersionLabel", extra={
        "_string": "版本 0.1.0",
        "_fontSize": 14,
        "_lineHeight": 20,
        "_color": make_color(139, 115, 85, 255),
        "_isSystemFontUsed": True,
    })
    
    # Version label widget
    sb.add_component("cc.Widget", "VersionLabel", extra={
        "_alignFlags": 14,
        "_isAbsHorizontal": True, "_horizontalCenter": 0,
        "_isAbsBottom": True, "_bottom": 30,
    })
    
    return sb.to_json()


def create_game_scene():
    """Create GameScene with 3D world, player, camera, and UI."""
    sb = SceneBuilder("GameScene")
    
    # ===== 3D World =====
    scene_idx = sb.node_ids["GameScene"]
    scene_obj = sb.objects[scene_idx]
    scene_obj["_globals"] = {
        "_ambientSky": make_color(179, 217, 255, 255),
        "_ambientGround": make_color(255, 240, 214, 255),
        "_ambientSH": None,
        "_fog": {
            "__type__": "cc.FogInfo",
            "enabled": True,
            "fogColor": make_color(255, 245, 230, 255),
            "type": 0,
            "fogDensity": 0.01,
            "fogStart": 50,
            "fogEnd": 300,
            "fogAtten": 1.0,
            "fogTop": 0.0,
            "fogRange": 0.0,
        },
        "_skybox": {
            "__type__": "cc.SkyboxInfo",
            "enabled": True,
            "useIBL": False,
            "useHDR": False,
            "envmap": None,
            "envmapLighting": None,
            "rotationAngle": 0,
            "material": None,
        },
        "_shadows": {
            "__type__": "cc.ShadowsInfo",
            "enabled": True,
            "type": 0,
            "normalBias": 0,
            "bias": 0.00001,
            "pcf": 2,
            "near": 0.1,
            "far": 10,
            "orthoSize": 5,
            "maxReceived": 4,
            "invisibleOcclusionRange": 200,
        },
        "_ambientMode": 1,
    }
    
    # ---- Main Light ----
    light_idx = sb.add_node("Main Light", "GameScene",
                           rot=make_quat(-0.06397656665577071, -0.44608233363525845, -0.8239028751062036, -0.3436591377065261))
    
    sb.add_component("cc.DirectionalLight", "Main Light", extra={
        "_color": make_color(255, 216, 168, 255),
        "_illuminance": 65000,
        "_illuminanceLDR": 1.7,
        "_shadowEnabled": True,
        "_shadowPcf": 2,
        "_shadowBias": 0.00001,
        "_shadowDistance": 50,
        "_shadowSaturation": 1.0,
        "_illuminanceHDR": 65000,
        "_staticSettings": {
            "__type__": "cc.StaticLightSettings",
            "_baked": False,
            "_editorOnly": False,
            "_castShadow": True,
        },
    })
    
    # ---- World container ----
    world_idx = sb.add_node("World", "GameScene")
    
    # ---- Ground ----
    ground_idx = sb.add_node("Ground", "World",
                            pos=make_vec3(0, -0.5, 0),
                            scale=make_vec3(10, 1, 10))
    
    # Ground MeshRenderer
    sb.add_component("cc.MeshRenderer", "Ground", extra={
        "_mesh": None,
        "_materials": [],
    })
    
    # Ground MeshCollider
    sb.add_component("cc.MeshCollider", "Ground", extra={
        "_isTrigger": False,
    })
    
    # ---- Player ----
    player_idx = sb.add_node("Player", "World",
                            pos=make_vec3(0, 0.5, 0))
    
    # Player CharacterController
    sb.add_component("cc.CharacterController", "Player", extra={
        "_slopeLimit": 45.0,
        "_stepOffset": 0.3,
        "_center": make_vec3(0, 0.5, 0),
        "_radius": 0.3,
        "_height": 1.0,
        "_skinWidth": 0.08,
        "_useGravity": True,
        "_detectColliders": 2147483647,
    })
    
    # Player CapsuleCollider
    sb.add_component("cc.CapsuleCollider", "Player", extra={
        "_isTrigger": False,
        "_radius": 0.3,
        "_cylinderHeight": 1.0,
        "_direction": 1,
        "_center": make_vec3(0, 0.5, 0),
    })
    
    # ---- Player Body (visual) ----
    body_idx = sb.add_node("Body", "Player",
                          pos=make_vec3(0, 0.5, 0),
                          scale=make_vec3(0.6, 1.0, 0.6))
    
    # Body MeshRenderer with PlayerMaterial
    sb.add_component("cc.MeshRenderer", "Body", extra={
        "_mesh": None,
        "_materials": [],
    })
    
    # ---- Test Obstacles ----
    obs1_idx = sb.add_node("Obstacle1", "World",
                          pos=make_vec3(3, 0.25, 2),
                          scale=make_vec3(0.5, 0.5, 0.5))
    
    sb.add_component("cc.MeshRenderer", "Obstacle1", extra={
        "_mesh": None,
        "_materials": [],
    })
    sb.add_component("cc.BoxCollider", "Obstacle1")
    
    obs2_idx = sb.add_node("Obstacle2", "World",
                          pos=make_vec3(-2, 0.5, 3),
                          scale=make_vec3(0.4, 1.0, 0.4))
    
    sb.add_component("cc.MeshRenderer", "Obstacle2", extra={
        "_mesh": None,
        "_materials": [],
    })
    sb.add_component("cc.BoxCollider", "Obstacle2")
    
    # ---- Main Camera ----
    cam_idx = sb.add_node("MainCamera", "World",
                         pos=make_vec3(0, 2, 5))
    
    # Camera component
    sb.add_component("cc.Camera", "MainCamera", extra={
        "_priority": 0,
        "_clearFlags": 1,
        "_color": make_color(126, 200, 227, 255),
        "_depth": 0,
        "_fov": 75,
        "_orthoHeight": 10,
        "_nearClip": 0.1,
        "_farClip": 1000,
        "_visibility": 1073741824,
        "_targetTexture": None,
    })
    
    # ===== UI Layer =====
    canvas_idx = sb.add_node("Canvas", "GameScene", layer=1073741824)
    
    sb.add_component("cc.Canvas", "Canvas", extra={
        "_renderMode": 0,
        "_designResolution": {"__type__": "cc.Size", "width": 1920, "height": 1080},
        "_fitToWidth": True,
        "_fitToHeight": True,
    })
    
    sb.add_component("cc.Widget", "Canvas", extra={
        "_alignFlags": 47,
    })
    
    # HUD
    hud_idx = sb.add_node("HUD", "Canvas", layer=1073741824)
    
    # Crosshair sprite
    crosshair_idx = sb.add_node("Crosshair", "HUD", layer=1073741824)
    sb.add_component("cc.Sprite", "Crosshair", extra={
        "_color": make_color(245, 166, 35, 128),
        "_sizeMode": 1,
        "_type": 0,
    })
    sb.add_component("cc.Widget", "Crosshair", extra={
        "_alignFlags": 12,
        "_isAbsHorizontal": True, "_horizontalCenter": 0,
        "_isAbsTop": True, "_top": -540,
    })
    
    # Perspective indicator
    persp_idx = sb.add_node("PerspectiveLabel", "HUD",
                           pos=make_vec3(0, -480, 0),
                           layer=1073741824)
    sb.add_component("cc.Label", "PerspectiveLabel", extra={
        "_string": "[第三人称]",
        "_fontSize": 16,
        "_lineHeight": 24,
        "_color": make_color(245, 166, 35, 255),
        "_isSystemFontUsed": True,
        "_isBold": True,
    })
    sb.add_component("cc.Widget", "PerspectiveLabel", extra={
        "_alignFlags": 14,
        "_isAbsRight": True, "_right": 30,
        "_isAbsBottom": True, "_bottom": 30,
    })
    
    # Controls hint
    hint_idx = sb.add_node("ControlsHint", "HUD",
                          pos=make_vec3(0, -480, 0),
                          layer=1073741824)
    sb.add_component("cc.Label", "ControlsHint", extra={
        "_string": "W/A/S/D 移动 | Space 跳跃 | F5 视角 | Esc 设置",
        "_fontSize": 14,
        "_lineHeight": 20,
        "_color": make_color(139, 115, 85, 255),
        "_isSystemFontUsed": True,
    })
    sb.add_component("cc.Widget", "ControlsHint", extra={
        "_alignFlags": 10,
        "_isAbsLeft": True, "_left": 20,
        "_isAbsBottom": True, "_bottom": 20,
    })
    
    return sb.to_json()


def write_scene_file(path, json_str):
    """Write scene file ensuring proper directory exists."""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(json_str)
    print(f"Created: {path}")


if __name__ == '__main__':
    base = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'assets', 'scenes')
    
    write_scene_file(os.path.join(base, 'StartScene.scene'), create_start_scene())
    write_scene_file(os.path.join(base, 'GameScene.scene'), create_game_scene())
    
    print("Done! Open in Cocos Creator editor.")
