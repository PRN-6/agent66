/**
 * ContinentalNavGraph.js
 * 
 * Provides a connected, continent-wide road & waypoint navigation network
 * spanning all 4 territories, central crossroads bridge, and High Valoria bypasses.
 * 
 * Guarantees that:
 * 1. Characters and NPCs route through safe bridges and open promenades.
 * 2. High Valoria Castle Town automatically routes through East/West bypasses,
 *    never walking into the central Grand Lion Fountain.
 * 3. Cross-continental journeys route cleanly across the Great River through
 *    the Crossroads Sanctuary Bridge.
 */

class NavNode {
  constructor(id, x, z, name = '') {
    this.id = id;
    this.x = x;
    this.z = z;
    this.name = name;
    this.neighbors = new Map(); // NavNode -> distance
  }

  addNeighbor(node, cost = null) {
    if (!node || node === this) return;
    const dist = cost ?? Math.hypot(this.x - node.x, this.z - node.z);
    this.neighbors.set(node, dist);
    node.neighbors.set(this, dist);
  }
}

export class ContinentalNavGraph {
  constructor() {
    this.nodes = new Map();
    this.initGraph();
  }

  initGraph() {
    // -----------------------------------------------------------------
    // 1. NEXUS HUB: Central Crossroads Bridge (Connects all 4 quadrants)
    // -----------------------------------------------------------------
    const bridgeCenter = this.addNode('nexus_bridge', 0, 10, 'Crossroads Sanctuary Bridge');
    const nexusEast    = this.addNode('nexus_east', 35, 10, 'Crossroads East Gate');
    const nexusWest    = this.addNode('nexus_west', -35, 10, 'Crossroads West Gate');
    const nexusSouth   = this.addNode('nexus_south', 8, 35, 'Crossroads South Trail');
    const nexusNorth   = this.addNode('nexus_north', -8, -35, 'Crossroads North Trail');

    bridgeCenter.addNeighbor(nexusEast);
    bridgeCenter.addNeighbor(nexusWest);
    bridgeCenter.addNeighbor(nexusSouth);
    bridgeCenter.addNeighbor(nexusNorth);

    // -----------------------------------------------------------------
    // 2. HUMAN KINGDOM OF VALORIA (North-East)
    // -----------------------------------------------------------------
    const oakhavenHamlet  = this.addNode('oakhaven', 105, 12, 'Oakhaven Agricultural Village');
    const valoriaMidWay   = this.addNode('valoria_midway', 155, -35, 'Valoria Trade Highway');
    const marketTavern    = this.addNode('market_tavern', 205, -80, 'Dragon’s Rest Tavern & Market');
    const valoriaSouthAve = this.addNode('valoria_south_ave', 290, -185, 'High Valoria South Avenue');

    nexusEast.addNeighbor(oakhavenHamlet);
    oakhavenHamlet.addNeighbor(valoriaMidWay);
    valoriaMidWay.addNeighbor(marketTavern);
    marketTavern.addNeighbor(valoriaSouthAve);

    // High Valoria Capital City Promenade Network (Bypassing Grand Lion Fountain)
    const hvSouthGate   = this.addNode('hv_south_gate', 370, -165, 'High Valoria South Gate');
    const hvArtisanJunc = this.addNode('hv_artisan_cross', 370, -210, 'Artisan Boulevard Crossing');
    const hvWestBypass  = this.addNode('hv_west_promenade', 352, -250, 'Lion Fountain West Promenade');
    const hvEastBypass  = this.addNode('hv_east_promenade', 388, -250, 'Lion Fountain East Promenade');
    const hvNorthPlaza  = this.addNode('hv_north_plaza', 370, -272, 'Clocktower North Plaza');
    const hvRoseGarden  = this.addNode('hv_rose_garden', 370, -295, 'Sunken Rose Garden Sanctuary');
    const citadelBarb   = this.addNode('citadel_gate', 380, -325, 'Royal Citadel South Barbican');
    const sunPavilion   = this.addNode('sun_pavilion', 470, -352, 'Princess Aurelia’s Sun Pavilion');

    valoriaSouthAve.addNeighbor(hvSouthGate);
    hvSouthGate.addNeighbor(hvArtisanJunc);
    hvArtisanJunc.addNeighbor(hvWestBypass);
    hvArtisanJunc.addNeighbor(hvEastBypass);
    hvWestBypass.addNeighbor(hvNorthPlaza);
    hvEastBypass.addNeighbor(hvNorthPlaza);
    hvNorthPlaza.addNeighbor(hvRoseGarden);
    hvRoseGarden.addNeighbor(citadelBarb);
    citadelBarb.addNeighbor(sunPavilion);

    // -----------------------------------------------------------------
    // 3. ENCHANTED FOREST OF THE ELVES (South-West)
    // -----------------------------------------------------------------
    const fernbrookHamlet = this.addNode('fernbrook', -75, 110, 'Fernbrook Woodland Hamlet');
    const sylvaheimGlade  = this.addNode('sylvaheim', -160, 90, 'Sylvaheim Elven Glade');
    const moonSpire       = this.addNode('moon_spire', -200, 185, 'Moon Spire Sanctuary');
    const elderCanopy     = this.addNode('elder_canopy', -140, 150, 'Colossal Elder Trees');

    nexusWest.addNeighbor(fernbrookHamlet);
    fernbrookHamlet.addNeighbor(sylvaheimGlade);
    sylvaheimGlade.addNeighbor(moonSpire);
    sylvaheimGlade.addNeighbor(elderCanopy);
    moonSpire.addNeighbor(elderCanopy);

    // -----------------------------------------------------------------
    // 4. INDUSTRIAL CITY OF THE DWARVES (South-East)
    // -----------------------------------------------------------------
    const dwarfFoothills = this.addNode('dwarf_foothills', 45, 60, 'Dwarf Foothills Road');
    const karakVornClan  = this.addNode('karak_vorn', 105, 140, 'Karak-Vorn United Clanstead');
    const karakDrak      = this.addNode('karak_drak', 200, 185, 'Karak-Drak Mountain Bastion');
    const blastFurnaces  = this.addNode('blast_furnaces', 140, 222, 'Great Blast Furnaces');
    const vanceLodge     = this.addNode('vance_lodge', 130, 252, 'Retired Hero’s Rustic Lodge');

    nexusSouth.addNeighbor(dwarfFoothills);
    dwarfFoothills.addNeighbor(karakVornClan);
    karakVornClan.addNeighbor(blastFurnaces);
    karakVornClan.addNeighbor(karakDrak);
    blastFurnaces.addNeighbor(vanceLodge);
    karakDrak.addNeighbor(blastFurnaces);

    // -----------------------------------------------------------------
    // 5. DARK TERRITORY OF THE DEMONS (North-West)
    // -----------------------------------------------------------------
    const demonRidgePath = this.addNode('demon_ridge', -60, -45, 'Volcanic Ridge Footpath');
    const kragmarEnclave = this.addNode('kragmar', -120, -90, 'Krag’mar Demon Enclave');
    const basaltBridge   = this.addNode('basalt_bridge', -180, -135, 'Nether Basalt Bridge');
    const dreadCitadel   = this.addNode('dread_citadel', -220, -170, 'Colossal Obsidian Dread Citadel');
    const voidAltar      = this.addNode('void_altar', -270, -238, 'Void Sacrificial Altar');

    nexusNorth.addNeighbor(demonRidgePath);
    demonRidgePath.addNeighbor(kragmarEnclave);
    kragmarEnclave.addNeighbor(basaltBridge);
    basaltBridge.addNeighbor(dreadCitadel);
    dreadCitadel.addNeighbor(voidAltar);
  }

  addNode(id, x, z, name) {
    const node = new NavNode(id, x, z, name);
    this.nodes.set(id, node);
    return node;
  }

  /**
   * Finds the nearest navigable road node to any given coordinates.
   */
  findNearestNode(x, z, maxDist = Infinity) {
    let bestNode = null;
    let minDist = maxDist;

    for (const node of this.nodes.values()) {
      const d = Math.hypot(node.x - x, node.z - z);
      if (d < minDist) {
        minDist = d;
        bestNode = node;
      }
    }

    return bestNode;
  }

  /**
   * Computes an optimal path of waypoints between start and end world coordinates.
   * Uses A* search across the continental highway graph.
   * 
   * @param {Object} start - { x, z }
   * @param {Object} destination - { x, z }
   * @returns {Array<Object>} Array of waypoint coordinates [{ x, z, name }]
   */
  findPath(start, destination) {
    if (!start || !destination) return [];

    const directDist = Math.hypot(destination.x - start.x, destination.z - start.z);

    // If target is very close (< 24m) and within same local area, go directly
    if (directDist < 24.0) {
      // Special check: if moving across High Valoria Fountain (x ~ 370, z ~ -250), force bypass!
      const minZ = Math.min(start.z, destination.z);
      const maxZ = Math.max(start.z, destination.z);
      const crossesFountain = Math.abs(start.x - 370) < 18 && minZ < -250 && maxZ > -250;

      if (!crossesFountain) {
        return [{ x: destination.x, z: destination.z, name: 'Direct Destination' }];
      }
    }

    const startNode = this.findNearestNode(start.x, start.z);
    const endNode = this.findNearestNode(destination.x, destination.z);

    if (!startNode || !endNode) {
      return [{ x: destination.x, z: destination.z, name: 'Fallback Destination' }];
    }

    if (startNode === endNode) {
      return [
        { x: startNode.x, z: startNode.z, name: startNode.name },
        { x: destination.x, z: destination.z, name: 'Destination' }
      ];
    }

    // A* Search on NavNodes
    const openSet = new Set([startNode]);
    const cameFrom = new Map();

    const gScore = new Map();
    gScore.set(startNode, 0);

    const fScore = new Map();
    fScore.set(startNode, Math.hypot(startNode.x - endNode.x, startNode.z - endNode.z));

    while (openSet.size > 0) {
      // Pick node in openSet with lowest fScore
      let current = null;
      let lowestF = Infinity;
      for (const node of openSet) {
        const f = fScore.get(node) ?? Infinity;
        if (f < lowestF) {
          lowestF = f;
          current = node;
        }
      }

      if (!current) break;

      if (current === endNode) {
        // Reconstruct path
        const path = [];
        let curr = current;
        while (curr) {
          path.unshift({ x: curr.x, z: curr.z, name: curr.name });
          curr = cameFrom.get(curr);
        }

        // Add destination point if not identical to endNode
        const endDist = Math.hypot(destination.x - endNode.x, destination.z - endNode.z);
        if (endDist > 3.0) {
          path.push({ x: destination.x, z: destination.z, name: 'Destination' });
        }

        return path;
      }

      openSet.delete(current);
      const currentG = gScore.get(current) ?? Infinity;

      for (const [neighbor, dist] of current.neighbors.entries()) {
        const tentativeG = currentG + dist;
        const neighborG = gScore.get(neighbor) ?? Infinity;

        if (tentativeG < neighborG) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentativeG);
          const h = Math.hypot(neighbor.x - endNode.x, neighbor.z - endNode.z);
          fScore.set(neighbor, tentativeG + h);
          openSet.add(neighbor);
        }
      }
    }

    // Fallback if no graph path found
    return [
      { x: startNode.x, z: startNode.z, name: startNode.name },
      { x: endNode.x, z: endNode.z, name: endNode.name },
      { x: destination.x, z: destination.z, name: 'Destination' }
    ];
  }
}

export const continentalNavGraph = new ContinentalNavGraph();

