import random

class Move:
    def __init__(self, name, move_type, power, accuracy):
        self.name = name
        self.move_type = move_type
        self.power = power
        self.accuracy = accuracy

class Pokemon:
    def __init__(self, name, p_type, hp, attack, defense, speed, moves):
        self.name = name
        self.p_type = p_type # e.g., "Fire", "Water", "Grass"
        self.max_hp = hp
        self.current_hp = hp
        self.attack = attack
        self.defense = defense
        self.speed = speed
        self.moves = moves # List of Move objects
        self.is_fainted = False

    def display_stats(self):
        print(f"\n{self.name} ({self.p_type})")
        print(f"HP: {self.current_hp}/{self.max_hp}")
        print(f"Attack: {self.attack}")
        print(f"Defense: {self.defense}")
        print(f"Speed: {self.speed}")
        print("Moves:")
        for i, move in enumerate(self.moves):
            print(f"  {i+1}. {move.name} (Power: {move.power}, Acc: {move.accuracy})")

    def take_damage(self, damage):
        self.current_hp -= damage
        if self.current_hp <= 0:
            self.current_hp = 0
            self.is_fainted = True
            print(f"\n{self.name} fainted!")
        else:
            print(f"\n{self.name} took {damage} damage. Remaining HP: {self.current_hp}")

    def attack_enemy(self, enemy_pokemon, move_index):
        if self.is_fainted:
            print(f"\n{self.name} has fainted and cannot attack.")
            return

        if not (0 <= move_index < len(self.moves)):
            print("Invalid move selection.")
            return

        move = self.moves[move_index]
        print(f"\n{self.name} uses {move.name}!")

        if random.random() * 100 > move.accuracy:
            print(f"{self.name}'s {move.name} missed!")
            return

        # Simplified damage calculation (ignoring type advantages/disadvantages for now)
        damage = ( ( ( (2/5 + 2) * move.power * self.attack / enemy_pokemon.defense ) / 50 ) + 2 )
        damage = int(damage)
        enemy_pokemon.take_damage(damage)

def battle(player_pokemon, wild_pokemon):
    print(f"\nA wild {wild_pokemon.name} appeared!")
    wild_pokemon.display_stats()

    while not player_pokemon.is_fainted and not wild_pokemon.is_fainted:
        player_pokemon.display_stats()
        print("\nWhat will you do?")
        print("1. Fight")
        print("2. Catch")
        print("3. Run")
        action = input("> ")

        if action == '1': # Fight
            print("\nChoose a move:")
            for i, move in enumerate(player_pokemon.moves):
                print(f"  {i+1}. {move.name}")
            move_choice = input("> ")
            try:
                move_idx = int(move_choice) - 1
                if not (0 <= move_idx < len(player_pokemon.moves)):
                    raise ValueError
                player_pokemon.attack_enemy(wild_pokemon, move_idx)
            except ValueError:
                print("Invalid move choice. Try again.")
                continue

            if wild_pokemon.is_fainted:
                print(f"\n{wild_pokemon.name} was defeated!")
                # Add EXP gain or other rewards here later
                break

            # Wild Pokemon's turn (simple AI: always attacks with first move)
            if not wild_pokemon.is_fainted:
                print(f"\nWild {wild_pokemon.name}'s turn:")
                wild_pokemon.attack_enemy(player_pokemon, 0) # Wild Pokemon uses its first move
                if player_pokemon.is_fainted:
                    print(f"\nOh no! Your {player_pokemon.name} fainted!")
                    print("Game Over! You blacked out...") # Simplified game over
                    break

        elif action == '2': # Catch
            # Simplified catch mechanic
            # Higher chance if wild Pokemon has low HP
            catch_chance = ( (wild_pokemon.max_hp * 3 - wild_pokemon.current_hp * 2) * 100 ) / (wild_pokemon.max_hp * 3)
            catch_chance = max(10, min(90, catch_chance)) # Clamp between 10% and 90%
            print(f"\nYou threw a Poke Ball! (Catch chance: {catch_chance:.2f}%)")
            if random.random() * 100 < catch_chance:
                print(f"Gotcha! {wild_pokemon.name} was caught!")
                # Add to player's collection here
                return wild_pokemon # Return the caught Pokemon
            else:
                print(f"Oh no! {wild_pokemon.name} broke free!")
                # Wild Pokemon's turn after failed catch attempt
                if not wild_pokemon.is_fainted:
                    print(f"\nWild {wild_pokemon.name}'s turn:")
                    wild_pokemon.attack_enemy(player_pokemon, 0)
                    if player_pokemon.is_fainted:
                        print(f"\nOh no! Your {player_pokemon.name} fainted!")
                        print("Game Over! You blacked out...")
                        break

        elif action == '3': # Run
            print("\nYou got away safely!")
            break
        else:
            print("Invalid action. Try again.")

    if player_pokemon.is_fainted:
        return None # Player lost
    elif wild_pokemon.is_fainted:
        return "defeated" # Wild Pokemon defeated
    return None # Ran away or other outcome


def main_game():
    # Define some moves
    tackle = Move("Tackle", "Normal", 40, 100)
    scratch = Move("Scratch", "Normal", 40, 100)
    ember = Move("Ember", "Fire", 40, 100)
    water_gun = Move("Water Gun", "Water", 40, 100)
    vine_whip = Move("Vine Whip", "Grass", 45, 100)
    quick_attack = Move("Quick Attack", "Normal", 40, 100)

    # Define some Pokemon
    player_pokemon_list = [
        Pokemon("Charmander", "Fire", 39, 52, 43, 65, [scratch, ember]),
        Pokemon("Squirtle", "Water", 44, 48, 65, 43, [tackle, water_gun]),
        Pokemon("Bulbasaur", "Grass", 45, 49, 49, 45, [tackle, vine_whip])
    ]

    wild_pokemon_templates = [
        Pokemon("Pidgey", "Normal/Flying", 40, 45, 40, 56, [tackle, quick_attack]),
        Pokemon("Rattata", "Normal", 30, 56, 35, 72, [tackle, quick_attack]),
        Pokemon("Caterpie", "Bug", 45, 30, 35, 45, [tackle])
    ]

    print("Welcome to the Pokemon World!")
    print("Choose your starter Pokemon:")
    for i, p in enumerate(player_pokemon_list):
        print(f"{i+1}. {p.name}")

    starter_choice = -1
    while True:
        try:
            choice = int(input("Enter the number of your choice: "))
            if 1 <= choice <= len(player_pokemon_list):
                starter_choice = choice -1
                break
            else:
                print("Invalid choice. Please select a valid number.")
        except ValueError:
            print("Invalid input. Please enter a number.")

    player_pokemon = player_pokemon_list[starter_choice]
    player_collection = [player_pokemon]
    print(f"\nYou chose {player_pokemon.name}!")
    player_pokemon.display_stats()

    while True: # Main game loop
        print("\nWhat would you like to do?")
        print("1. Find a wild Pokemon")
        print("2. View your Pokemon")
        print("3. Exit game")
        action = input("> ")

        if action == '1':
            # Select a random wild Pokemon
            wild_template = random.choice(wild_pokemon_templates)
            # Create a new instance for the battle
            current_wild_pokemon = Pokemon(wild_template.name, wild_template.p_type, 
                                           wild_template.max_hp, wild_template.attack, 
                                           wild_template.defense, wild_template.speed, 
                                           [Move(m.name, m.move_type, m.power, m.accuracy) for m in wild_template.moves])
            
            # Ensure player's current Pokemon is not fainted before battle
            # For simplicity, we'll use the first Pokemon in the collection that's not fainted.
            # A more complex game would allow switching.
            active_player_pokemon = None
            for p in player_collection:
                if not p.is_fainted:
                    active_player_pokemon = p
                    break
            
            if not active_player_pokemon:
                print("All your Pokemon have fainted! You should rest.") # Simplified, could lead to a Pokemon Center
                continue

            print(f"\nYour active Pokemon is {active_player_pokemon.name}.")
            battle_result = battle(active_player_pokemon, current_wild_pokemon)

            if isinstance(battle_result, Pokemon): # Caught a Pokemon
                player_collection.append(battle_result)
                print(f"\n{battle_result.name} was added to your collection!")
                print(f"You now have {len(player_collection)} Pokemon.")
            elif battle_result == "defeated":
                print("You won the battle!")
            elif active_player_pokemon.is_fainted:
                print("Returning to the main menu...")
                # Check if all Pokemon fainted for game over
                all_fainted = True
                for p in player_collection:
                    if not p.is_fainted:
                        all_fainted = False
                        break
                if all_fainted:
                    print("\nAll your Pokemon have fainted! Game Over.")
                    break # Exit game loop

        elif action == '2':
            print("\nYour Pokemon collection:")
            if not player_collection:
                print("You don't have any Pokemon yet.")
            for i, p in enumerate(player_collection):
                print(f"--- Pokemon {i+1} ---")
                p.display_stats()
                if p.is_fainted:
                    print("(Fainted)")
        elif action == '3':
            print("Thanks for playing!")
            break
        else:
            print("Invalid action. Try again.")

if __name__ == "__main__":
    main_game()