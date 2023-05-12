import openmc
import numpy as np
import matplotlib.pyplot as plt

detector_mean = []
detector_err  = []
detector_x    = []

# First, we define the poly for our cube
poly = openmc.Material()
poly.set_density('g/cm3', 0.92) # The density of the Poly in g/cm^3
# The numbers next to each isotpe are the atom fraction by default.
poly.add_nuclide('C0', 1.) # Change 'C12' to 'C0' if using ENDF/B-VII.1 with natural carbon
poly.add_nuclide('H1',  2.)
# We need to add the thermal scattering law for the Poly
poly.add_s_alpha_beta('c_H_in_CH2')

# Make the materials.xml file, which will contain only the single mat material.
mats = openmc.Materials([poly])
mats.export_to_xml()

# Next, we define the surfaces  needed to model the geometry. All of the
# surfaces have 'vacuum' boundary conditions, because once the particle
# leaves the cube, we assume it will never come back (i.e. outside the cube
# is a vacuum).
x_low = openmc.XPlane(x0=-23.0, boundary_type='vacuum')
x_hi  = openmc.XPlane(x0= 23.0, boundary_type='vacuum')
y_low = openmc.YPlane(y0=-30.0, boundary_type='vacuum')
y_hi  = openmc.YPlane(y0= 30.0, boundary_type='vacuum')
z_low = openmc.ZPlane(z0=-30.0, boundary_type='vacuum')
z_hi  = openmc.ZPlane(z0= 30.0, boundary_type='vacuum')

# We now combine the surfaces together to make our cube. The cube is the only
# cell we will have in our geometry definition.
cube_region = +x_low & -x_hi & +y_low & -y_hi & +z_low & -z_hi
cube = openmc.Cell(fill=poly, region=cube_region)

# Make the geometry.xml file
geom = openmc.Geometry([cube])
geom.export_to_xml()

# Now we define the tally for the detector
mesh = openmc.RegularMesh()
mesh.dimension = [1, 13, 1]
mesh.lower_left  = [-3.9, -28.75, -0.5]
mesh.upper_right = [-2.9,   3.75,  0.5]
mesh_filter = openmc.MeshFilter(mesh)
tally = openmc.Tally(name='detector')
tally.filters.append(mesh_filter) # Only score in the detectors !!
tally.scores = ['flux']
tallies = openmc.Tallies()
tallies.append(tally)
tallies.export_to_xml()

# Now we define the run settings
settings = openmc.Settings()
settings.run_mode = 'fixed source'
settings.batches = 50 # Number of batches
settings.particles = 10000 # Number of particles
settings.cutoff = {'energy_neutron': 0.001} # Kill neutrons with energy < 0.001 eV

# Define the neutron source for the problem
source = openmc.Source()
source.space  = openmc.stats.Point((0., 0., 0.)) # Source is located at the origin
source.angle  = openmc.stats.Isotropic() # The source neutrons have an isotropic direction distribution
source.energy = openmc.stats.Watt(a=1.025E6, b=2.926E-6) # a has units [eV], b has units [eV^(-1)]
settings.source = source

# Write the settings file
settings.export_to_xml()

# Run OpenMC
openmc.run()

# Get the results
n = settings.batches
with openmc.StatePoint(f'statepoint.{n}.h5') as sp:
  tally = sp.get_tally(name='detector') # The same name we used when making tally
  detector_mean = tally.mean.flatten()
  detector_err  = tally.std_dev.flatten() / np.sqrt(settings.batches)

  for i in range(13):
    detector_x.append(-27.5 + i*2.5)

  print("x =", detector_x)
  print("mean =", detector_mean)
  print("std", detector_err)

  plt.errorbar(detector_x, detector_mean, yerr=detector_err)
  plt.yscale('log')
  plt.xlabel('Detector Position [cm]')
  plt.ylabel('Flux [Arb. Units.]')
  plt.show()