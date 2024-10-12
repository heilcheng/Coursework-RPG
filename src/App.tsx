import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Book, Star, Scroll, FileText, PenTool, GraduationCap, Calculator, BarChart, Coffee, Plus, Save, Download } from 'lucide-react';

const initialSkills = {
  DISCRETE_MATH: { name: 'Discrete Math', icon: 'Calculator', effect: 'Enhances problem-solving in MA2509', level: 1, exp: 0 },
  STAT_PROB: { name: 'Statistics & Probability', icon: 'BarChart', effect: 'Improves data analysis in MA2510', level: 1, exp: 0 },
  JAVA_PROGRAMMING: { name: 'Java Programming', icon: 'Coffee', effect: 'Boosts coding efficiency in CS2360', level: 1, exp: 0 }
};

const QuestTypes = {
  ASSIGNMENT: { name: 'Assignment', icon: 'FileText', baseReward: 50 },
  MIDTERM: { name: 'Midterm', icon: 'PenTool', baseReward: 150 },
  FINAL: { name: 'Final Exam', icon: 'GraduationCap', baseReward: 300 }
};

const iconMap = {
  Calculator, BarChart, Coffee, FileText, PenTool, GraduationCap, Star, Book
};

const App = () => {
  const [gameState, setGameState] = useState(() => {
    const savedState = localStorage.getItem('courseRPGState');
    if (savedState) {
      return JSON.parse(savedState);
    }
    return {
      player: {
        name: "Student",
        level: 1,
        exp: 0,
        careerGoal: "",
        skills: initialSkills
      },
      courses: [
        { id: 1, name: "MA2509", progress: 0, totalTasks: 10, relatedSkill: 'DISCRETE_MATH' },
        { id: 2, name: "MA2510", progress: 0, totalTasks: 8, relatedSkill: 'STAT_PROB' },
        { id: 3, name: "CS2360", progress: 0, totalTasks: 12, relatedSkill: 'JAVA_PROGRAMMING' }
      ],
      quests: []
    };
  });

  const [newQuest, setNewQuest] = useState({ name: '', courseId: '', type: '' });
  const [newSkill, setNewSkill] = useState({ name: '', effect: '' });
  const [newCourse, setNewCourse] = useState({ name: '', totalTasks: '', relatedSkill: '' });

  useEffect(() => {
    localStorage.setItem('courseRPGState', JSON.stringify(gameState));
  }, [gameState]);

  useEffect(() => {
    if (gameState.quests.length === 0) {
      const generatedQuests = gameState.courses.flatMap(course => [
        {
          id: `${course.id}-assignment1`,
          courseId: course.id,
          name: `${course.name} Assignment 1`,
          type: QuestTypes.ASSIGNMENT,
          reward: QuestTypes.ASSIGNMENT.baseReward,
          completed: false
        },
        {
          id: `${course.id}-midterm`,
          courseId: course.id,
          name: `${course.name} Midterm`,
          type: QuestTypes.MIDTERM,
          reward: QuestTypes.MIDTERM.baseReward,
          completed: false
        },
        {
          id: `${course.id}-final`,
          courseId: course.id,
          name: `${course.name} Final Exam`,
          type: QuestTypes.FINAL,
          reward: QuestTypes.FINAL.baseReward,
          completed: false
        }
      ]);
      setGameState(prev => ({ ...prev, quests: generatedQuests }));
    }
  }, [gameState.courses, gameState.quests.length]);

  const completeQuest = (questId) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (quest && !quest.completed) {
        const expGain = quest.reward;
        const course = prev.courses.find(c => c.id === quest.courseId);
        
        const newPlayer = { ...prev.player };
        newPlayer.exp += expGain;
        newPlayer.level = Math.floor(newPlayer.exp / 100) + 1;
        
        Object.keys(newPlayer.skills).forEach(skillKey => {
          const skillExpGain = skillKey === course.relatedSkill ? Math.round(expGain * 0.5) : Math.round(expGain * 0.1);
          const skill = newPlayer.skills[skillKey];
          skill.exp += skillExpGain;
          skill.level = Math.floor(skill.exp / 50) + 1;
        });

        const newCourses = prev.courses.map(c => 
          c.id === quest.courseId ? { ...c, progress: c.progress + 1 } : c
        );

        const newQuests = prev.quests.map(q => 
          q.id === questId ? { ...q, completed: true } : q
        );

        return { ...prev, player: newPlayer, courses: newCourses, quests: newQuests };
      }
      return prev;
    });
  };

  const addNewQuest = () => {
    if (newQuest.name && newQuest.courseId && newQuest.type) {
      const questType = QuestTypes[newQuest.type];
      setGameState(prev => ({
        ...prev,
        quests: [
          ...prev.quests,
          {
            id: `custom-${Date.now()}`,
            courseId: parseInt(newQuest.courseId),
            name: newQuest.name,
            type: questType,
            reward: questType.baseReward,
            completed: false
          }
        ]
      }));
      setNewQuest({ name: '', courseId: '', type: '' });
    }
  };

  const addNewSkill = () => {
    if (newSkill.name && newSkill.effect) {
      const skillKey = newSkill.name.toUpperCase().replace(/\s+/g, '_');
      setGameState(prev => ({
        ...prev,
        player: {
          ...prev.player,
          skills: {
            ...prev.player.skills,
            [skillKey]: { name: newSkill.name, icon: 'Star', effect: newSkill.effect, level: 1, exp: 0 }
          }
        }
      }));
      setNewSkill({ name: '', effect: '' });
    }
  };

  const addNewCourse = () => {
    if (newCourse.name && newCourse.totalTasks && newCourse.relatedSkill) {
      setGameState(prev => ({
        ...prev,
        courses: [
          ...prev.courses,
          {
            id: prev.courses.length + 1,
            name: newCourse.name,
            progress: 0,
            totalTasks: parseInt(newCourse.totalTasks),
            relatedSkill: newCourse.relatedSkill
          }
        ]
      }));
      setNewCourse({ name: '', totalTasks: '', relatedSkill: '' });
    }
  };

  const setCareerGoal = (goal) => {
    setGameState(prev => ({
      ...prev,
      player: { ...prev.player, careerGoal: goal }
    }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(gameState);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'coursework-rpg-data.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        try {
          const parsedData = JSON.parse(content);
          setGameState(parsedData);
          localStorage.setItem('courseRPGState', content);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          alert('Invalid file format. Please upload a valid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <Star className="mr-2 inline" /> {gameState.player.name} - Level {gameState.player.level}
            </div>
            <div>
              <Button onClick={exportData} className="mr-2">
                <Save className="mr-2" /> Export Data
              </Button>
              <label htmlFor="import-data" className="cursor-pointer">
                <Button as="span">
                  <Download className="mr-2" /> Import Data
                </Button>
              </label>
              <input
                id="import-data"
                type="file"
                accept=".json"
                onChange={importData}
                style={{ display: 'none' }}
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={(gameState.player.exp % 100)} className="w-full" />
          <p className="mt-2">EXP: {gameState.player.exp} / {gameState.player.level * 100}</p>
          <div className="mt-2">
            <strong>Career Goal:</strong> {gameState.player.careerGoal || "Not set"}
            <Input 
              placeholder="Enter your career goal" 
              value={gameState.player.careerGoal}
              onChange={(e) => setCareerGoal(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="mt-2">
            <strong>Skills:</strong>
            {Object.entries(gameState.player.skills).map(([key, skill]) => {
              const IconComponent = iconMap[skill.icon] || Star;
              return (
                <div key={key} className="flex items-center mt-1">
                  <IconComponent className="mr-2" size={16} />
                  <span>{skill.name} - Level {skill.level}</span>
                  <Progress value={(skill.exp % 50) * 2} className="w-24 ml-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add New Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              placeholder="Skill Name" 
              value={newSkill.name}
              onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
            />
            <Input 
              placeholder="Skill Effect" 
              value={newSkill.effect}
              onChange={(e) => setNewSkill({...newSkill, effect: e.target.value})}
            />
            <Button onClick={addNewSkill}>Add Skill</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add New Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              placeholder="Course Name" 
              value={newCourse.name}
              onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
            />
            <Input 
              placeholder="Total Tasks" 
              type="number"
              value={newCourse.totalTasks}
              onChange={(e) => setNewCourse({...newCourse, totalTasks: e.target.value})}
            />
            <Select 
              value={newCourse.relatedSkill} 
              onValueChange={(value) => setNewCourse({...newCourse, relatedSkill: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Related Skill" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(gameState.player.skills).map(skillKey => (
                  <SelectItem key={skillKey} value={skillKey}>
                    {gameState.player.skills[skillKey].name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addNewCourse}>Add Course</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add New Quest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input 
              placeholder="Quest Name" 
              name="name"
              value={newQuest.name}
              onChange={(e) => setNewQuest({...newQuest, name: e.target.value})}
            />
            <Select onValueChange={(value) => setNewQuest({ ...newQuest, courseId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select Course" />
              </SelectTrigger>
              <SelectContent>
                {gameState.courses.map(course => (
                  <SelectItem key={course.id} value={course.id.toString()}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => setNewQuest({ ...newQuest, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Quest Type" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(QuestTypes).map(type => (
                  <SelectItem key={type} value={type}>{QuestTypes[type].name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addNewQuest}>Add Quest</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gameState.courses.map(course => (
          <Card key={course.id}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Book className="mr-2" /> {course.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={(course.progress / course.totalTasks) * 100} className="w-full mb-2" />
              <p>Progress: {course.progress} / {course.totalTasks}</p>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Quests</h3>
                {gameState.quests
                  .filter(quest => quest.courseId === course.id)
                  .map(quest => {
                    const IconComponent = iconMap[quest.type.icon] || Star;
                    return (
                      <div key={quest.id} className="mb-2 flex items-center">
                        <IconComponent className="mr-2" size={16} />
                        <span className="flex-grow">{quest.name}</span>
                        <span className="mr-2">({quest.reward} EXP)</span>
                        <Button 
                          onClick={() => completeQuest(quest.id)} 
                          disabled={quest.completed}
                          size="sm"
                        >
                          {quest.completed ? 'Completed' : 'Complete'}
                        </Button>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default App;