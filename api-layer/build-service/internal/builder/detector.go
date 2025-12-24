package builder

import (
	"build-service/pkg"
	"encoding/json"
	"errors"
	"path/filepath"
)

type Framework struct {
	Name     string
	Version  string
	BuildCmd string
	Runtime  string
	Port     int
}

func DetectFramework(projectPath string) (*Framework, error) {
	if pkg.FileExists(filepath.Join(projectPath, "package.json")) {
		return detectNodeFramework(projectPath)
	}

	if pkg.FileExists(filepath.Join(projectPath, "requirements.txt")) ||
		pkg.FileExists(filepath.Join(projectPath, "Pipfile")) {
		return detectPythonFramework(projectPath)
	}

	if pkg.FileExists(filepath.Join(projectPath, "go.mod")) {
		return detectGoFramework(projectPath)
	}

	if pkg.FileExists(filepath.Join(projectPath, "composer.json")) {
		return detectPHPFramework(projectPath)
	}

	if pkg.FileExists(filepath.Join(projectPath, "Gemfile")) {
		return detectRubyFramework(projectPath)
	}

	if pkg.FileExists(filepath.Join(projectPath, "pom.xml")) ||
		pkg.FileExists(filepath.Join(projectPath, "build.gradle")) {
		return detectJVMFramework(projectPath)
	}

	return nil, errors.New("unknown framework")
}

func detectNodeFramework(projectPath string) (*Framework, error) {

	data, err := pkg.ReadFile(filepath.Join(projectPath, "package.json"))
	if err != nil {
		return nil, err
	}

	var packageJSON struct {
		Dependencies map[string]string `json:"dependencies"`
		Scripts      map[string]string `json:"scripts"`
	}

	json.Unmarshal(data, &packageJSON)

	if _, ok := packageJSON.Scripts["next"]; ok {
		return &Framework{
			Name:     "Next.js",
			Runtime:  "node:22-alpine",
			BuildCmd: "npm run build",
			Port:     3000,
		}, nil
	}

	if _, ok := packageJSON.Dependencies["react"]; ok {
		if _, hasVite := packageJSON.Dependencies["vite"]; hasVite {
			return &Framework{
				Name:     "Vite + React",
				Runtime:  "node:22-alpine",
				BuildCmd: "npm run build",
				Port:     3000,
			}, nil
		}
	}

	if _, ok := packageJSON.Dependencies["express"]; ok {
		return &Framework{
			Name:     "Express.js",
			Runtime:  "node:20-alpine",
			BuildCmd: "npm install",
			Port:     3000,
		}, nil
	}

	// Default Node.js
	return &Framework{
		Name:     "Node.js",
		Runtime:  "node:20-alpine",
		BuildCmd: "npm install",
		Port:     3000,
	}, nil

}

func detectPythonFramework(projectPath string) (*Framework, error) {
	return &Framework{
		Name:     "python",
		Version:  "latest",
		BuildCmd: "pip install -r requirements.txt",
		Runtime:  "python",
		Port:     8000,
	}, nil
}

func detectGoFramework(projectPath string) (*Framework, error) {
	return &Framework{
		Name:     "go",
		Version:  "latest",
		BuildCmd: "go build",
		Runtime:  "go",
		Port:     8080,
	}, nil
}

func detectPHPFramework(projectPath string) (*Framework, error) {
	return &Framework{
		Name:     "php",
		Version:  "latest",
		BuildCmd: "composer install",
		Runtime:  "php",
		Port:     8000,
	}, nil
}

func detectRubyFramework(projectPath string) (*Framework, error) {
	return &Framework{
		Name:     "ruby",
		Version:  "latest",
		BuildCmd: "bundle install",
		Runtime:  "ruby",
		Port:     3000,
	}, nil
}

func detectJVMFramework(projectPath string) (*Framework, error) {
	return &Framework{
		Name:     "java",
		Version:  "latest",
		BuildCmd: "mvn clean package",
		Runtime:  "java",
		Port:     8080,
	}, nil
}
