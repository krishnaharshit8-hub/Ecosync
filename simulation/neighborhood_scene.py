# simulation/neighborhood_scene.py
# Run with: $ISAAC_PATH/python.sh simulation/neighborhood_scene.py
# NOTE: Requires NVIDIA Isaac Sim installed with RTX GPU
import omni
import omni.isaac.core as core_utils
from omni.isaac.core import World
from pxr import Gf
import numpy as np


def create_neighborhood():
    world = World(stage_units_in_meters=1.0)
    world.scene.add_default_ground_plane()

    # House positions in a grid layout
    positions = [
        Gf.Vec3f(0, 0, 0),     # H1
        Gf.Vec3f(15, 0, 0),    # H2
        Gf.Vec3f(30, 0, 0),    # H3
        Gf.Vec3f(0, 15, 0),    # H4 (MedCenter)
        Gf.Vec3f(15, 15, 0),   # H5
    ]

    for i, pos in enumerate(positions):
        prim_path = f'/World/House_{i+1}'
        # Create house as a box primitive
        omni.kit.commands.execute('CreatePrimWithDefaultXform',
            prim_type='Cube',
            prim_path=prim_path + '/Body'
        )
        # Add solar panel on roof
        omni.kit.commands.execute('CreatePrimWithDefaultXform',
            prim_type='Cube',
            prim_path=prim_path + '/SolarPanel'
        )

    # Add a distant light to simulate the sun
    omni.kit.commands.execute('CreatePrimWithDefaultXform',
        prim_type='DistantLight',
        prim_path='/World/Sun'
    )

    world.reset()
    return world


if __name__ == '__main__':
    world = create_neighborhood()
    print('Neighborhood scene created successfully')
