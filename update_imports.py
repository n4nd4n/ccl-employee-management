import os
import re
import sys # Import the sys module to access command-line arguments

def update_jsx_imports(project_root):
    src_path = os.path.join(project_root, 'src')
    if not os.path.exists(src_path):
        print(f"Error: 'src' directory not found at {src_path}")
        return

    for root, _, files in os.walk(src_path):
        for file in files:
            if file.endswith('.jsx'):
                file_path = os.path.join(root, file)
                print(f"Processing {file_path}...")
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex to find import statements from '@/components/ui'
                # This regex captures the imported items and the component name
                # Example: import { Button } from '@/components/ui/button';
                # Group 1: { Button }
                # Group 2: button
                pattern = r"(import\s*{[^}]+}\s*from\s*)['\"]@/components/ui/([^'\"]+)['\"];"
                
                # Replacement function
                def replace_match(match):
                    imported_items = match.group(1)
                    component_name = match.group(2)
                    # Construct the relative path based on the current file's location
                    # This assumes all components are directly under src/components/ui
                    # and the current file is either in src/components or src/contexts
                    
                    # Calculate relative path from current file to src/components/ui
                    relative_path_to_src = os.path.relpath(os.path.join(project_root, 'src'), root)
                    relative_path_to_ui = os.path.join(relative_path_to_src, 'components', 'ui', component_name)
                    
                    # Normalize path to use forward slashes for imports
                    relative_path_to_ui = relative_path_to_ui.replace('\\', '/')
                    
                    return f"{imported_items}'./{relative_path_to_ui}';"

                new_content = re.sub(pattern, replace_match, content)
                
                if new_content != content:
                    print(f"  Updated imports in {file} ")
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                else:
                    print(f"  No changes needed in {file}")

    print("Import path update complete.")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        project_path = sys.argv[1]
        update_jsx_imports(project_path)
    else:
        print("Usage: python update_imports.py <path_to_ccl-employee-management_folder>")
        print("Example: python update_imports.py \"C:\\Users\\badsh\\OneDrive\\Desktop\\ccl-employee-management\"")

