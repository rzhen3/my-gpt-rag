from typing import Dict, Optional

class IDMapper:
    # simple mapper between frontend IDs and backend db IDs

    def __init__(self):
        self._mappings: Dict[str, int] = {}

    def add_mapping(self, temp_id: str, db_id: int) -> None:
        self._mappings[temp_id] = db_id
        print(f"[IDMapper] Storedi mapping: {temp_id} -> {db_id}")

    def resolve_id(self, node_id: str) -> int:        
        if node_id.startswith("temp_"):
            print("is temp.")
            # valid temporary ID
            if node_id in self._mappings:
                db_id = self._mappings[node_id]
                print(f"[IDMapper] Resolved temp ID: {node_id} -> {db_id}")
                return db_id
            
            # fake temporary ID
            else:
                raise ValueError(f"Unknown temporary ID: {node_id}")
            
        # already a DB ID (assumes that we only get non-malicious requests from frontend)
        # unsafe so MVP only. 
        try:
            db_id = int(node_id)
            print(f"[IDMapper] Using database ID: {db_id}")
            return db_id
        except ValueError:
            raise ValueError(f"Invalid node ID format: {node_id}")
            
    def get_mapping(self, temp_id: str) -> Optional[int]:
        return self._mappings.get(temp_id)
    
    # reset mappings
    def clear_mappings(self) -> None:
        self._mappings.clear()
        print("[IDMapper] Cleared all mappings")

id_mapper = IDMapper()