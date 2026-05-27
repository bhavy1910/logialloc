from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import numpy as np

def create_distance_matrix(size):
    matrix = np.random.randint(10, 100, size=(size, size))
    np.fill_diagonal(matrix, 0)
    return matrix.tolist()

def optimize_routes(df):

    locations = len(df)

    distance_matrix = create_distance_matrix(locations)

    manager = pywrapcp.RoutingIndexManager(
        len(distance_matrix),
        1,
        0
    )

    routing = pywrapcp.RoutingModel(manager)

    def distance_callback(from_index, to_index):

        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)

        return distance_matrix[from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(
        distance_callback
    )

    routing.SetArcCostEvaluatorOfAllVehicles(
        transit_callback_index
    )

    search_parameters = pywrapcp.DefaultRoutingSearchParameters()

    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    solution = routing.SolveWithParameters(search_parameters)

    route = []

    index = routing.Start(0)

    while not routing.IsEnd(index):

        route.append(manager.IndexToNode(index))

        index = solution.Value(routing.NextVar(index))

    route.append(manager.IndexToNode(index))

    return route