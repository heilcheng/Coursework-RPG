import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardActions, Typography, LinearProgress, Button, TextField, Select, MenuItem, Grid } from '@mui/material';
import { Book, Star, FileText, PenTool, GraduationCap, Calculator, BarChart, Coffee, Save, Download } from 'lucide-react';

interface Skill {
  name: string;
  icon: string;
  effect: string;
  level: number;
  exp: number;
}

interface Course {
  id: number;
  name: string;
  progress: number;
  totalTasks: number;
  relatedSkill: string;
}

interface Quest {
  id: string;
  courseId: number;
  name: string;
  type: {
    name: string;
    icon: string;
    baseReward: number;
  };
  reward: number;
  completed: boolean;
}

interface GameState {
  player: {
    name: string;
    level: number;
    exp: number;
    careerGoal: string;
    skills: { [key: string]: Skill };
  };
  courses: Course[];
  quests: Quest[];
}

const QuestTypes: { [key: string]: { name: string; icon: string; baseReward: number } } = {
  ASSIGNMENT: { name: 'Assignment', icon: 'FileText', baseReward: 50 },
  MIDTERM: { name: 'Midterm', icon: 'PenTool', baseReward: 150 },
  FINAL: { name: 'Final Exam', icon: 'GraduationCap', baseReward: 300 }
};

const initialSkills: { [key: string]: Skill } = {
  DISCRETE_MATH: { name: 'Discrete Math', icon: 'Calculator', effect: 'Enhances problem-solving in MA2509', level: 1, exp: 0 },
  STAT_PROB: { name: 'Statistics & Probability', icon: 'BarChart', effect: 'Improves data analysis in MA2510', level: 1, exp: 0 },
  JAVA_PROGRAMMING: { name: 'Java Programming', icon: 'Coffee', effect: 'Boosts coding efficiency in CS2360', level: 1, exp: 0 }
};

const iconMap: { [key: string]: React.ElementType } = {
  Calculator, BarChart, Coffee, FileText, PenTool, GraduationCap, Star, Book
};

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() => {
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
      const generatedQuests = gameState.courses.flatMap((course: Course) => [
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

  const completeQuest = (questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (quest && !quest.completed) {
        const expGain = quest.reward;
        const course = prev.courses.find(c => c.id === quest.courseId);
        
        const newPlayer = { ...prev.player };
        newPlayer.exp += expGain;
        newPlayer.level = Math.floor(newPlayer.exp / 100) + 1;
        
        Object.keys(newPlayer.skills).forEach(skillKey => {
          const skillExpGain = skillKey === course?.relatedSkill ? Math.round(expGain * 0.5) : Math.round(expGain * 0.1);
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

  const setCareerGoal = (goal: string) => {
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

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {
          try {
            const parsedData = JSON.parse(content);
            setGameState(parsedData);
            localStorage.setItem('courseRPGState', content);
          } catch (error) {
            console.error('Error parsing JSON:', error);
            alert('Invalid file format. Please upload a valid JSON file.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Card sx={{ marginBottom: 2 }}>
        <CardHeader
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">
                <Star style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                {gameState.player.name} - Level {gameState.player.level}
              </Typography>
              <div>
                <Button onClick={exportData} startIcon={<Save />} sx={{ marginRight: 1 }}>
                  Export Data
                </Button>
                <label htmlFor="import-data">
                  <Button component="span" startIcon={<Download />}>
                    Import Data
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
            </div>
          }
        />
        <CardContent>
          <LinearProgress variant="determinate" value={(gameState.player.exp % 100)} sx={{ marginBottom: 1 }} />
          <Typography>EXP: {gameState.player.exp} / {gameState.player.level * 100}</Typography>
          <Typography sx={{ marginTop: 2 }}>
            <strong>Career Goal:</strong> {gameState.player.careerGoal || "Not set"}
          </Typography>
          <TextField 
            fullWidth
            placeholder="Enter your career goal" 
            value={gameState.player.careerGoal}
            onChange={(e) => setCareerGoal(e.target.value)}
            sx={{ marginTop: 1 }}
          />
          <Typography sx={{ marginTop: 2 }}><strong>Skills:</strong></Typography>
          {Object.entries(gameState.player.skills).map(([key, skill]) => {
            const IconComponent = iconMap[skill.icon] || Star;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
                <IconComponent size={16} style={{ marginRight: '0.5rem' }} />
                <Typography>{skill.name} - Level {skill.level}</Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={(skill.exp % 50) * 2} 
                  sx={{ width: '100px', marginLeft: '0.5rem' }} 
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card sx={{ marginBottom: 2 }}>
        <CardHeader title="Add New Skill" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <TextField 
                fullWidth
                placeholder="Skill Name" 
                value={newSkill.name}
                onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField 
                fullWidth
                placeholder="Skill Effect" 
                value={newSkill.effect}
                onChange={(e) => setNewSkill({...newSkill, effect: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button onClick={addNewSkill} variant="contained" fullWidth>Add Skill</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ marginBottom: 2 }}>
        <CardHeader title="Add New Course" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <TextField 
                fullWidth
                placeholder="Course Name" 
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField 
                fullWidth
                placeholder="Total Tasks" 
                type="number"
                value={newCourse.totalTasks}
                onChange={(e) => setNewCourse({...newCourse, totalTasks: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Select
                fullWidth
                value={newCourse.relatedSkill}
                onChange={(e) => setNewCourse({...newCourse, relatedSkill: e.target.value as string})}
                displayEmpty
              >
                <MenuItem value="" disabled>Related Skill</MenuItem>
                {Object.keys(gameState.player.skills).map(skillKey => (
                  <MenuItem key={skillKey} value={skillKey}>
                    {gameState.player.skills[skillKey].name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button onClick={addNewCourse} variant="contained" fullWidth>Add Course</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ marginBottom: 2 }}>
        <CardHeader title="Add New Quest" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth
                placeholder="Quest Name" 
                value={newQuest.name}
                onChange={(e) => setNewQuest({...newQuest, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Select
                fullWidth
                value={newQuest.courseId}
                onChange={(e) => setNewQuest({...newQuest, courseId: e.target.value as string})}
                displayEmpty
              >
                <MenuItem value="" disabled>Select Course</MenuItem>
                {gameState.courses.map(course => (
                  <MenuItem key={course.id} value={course.id.toString()}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Select
                fullWidth
                value={newQuest.type}
                onChange={(e) => setNewQuest({...newQuest, type: e.target.value as string})}
                displayEmpty
              >
                <MenuItem value="" disabled>Quest Type</MenuItem>
                {Object.keys(QuestTypes).map(type => (
                  <MenuItem key={type} value={type}>
                    {QuestTypes[type].name}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button onClick={addNewQuest} variant="contained" fullWidth>Add Quest</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={2}>
        {gameState.courses.map(course => (
          <Grid item xs={12} sm={6} md={4} key={course.id}>
            <Card>
              <CardHeader
                title={
                  <Typography variant="h6">
                    <Book style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    {course.name}
                  </Typography>
                }
              />
              <CardContent>
                <LinearProgress 
                  variant="determinate" 
                  value={(course.progress / course.totalTasks) * 100} 
                  sx={{ marginBottom: 1 }} 
                />
                <Typography>Progress: {course.progress} / {course.totalTasks}</Typography>
                <Typography sx={{ marginTop: 2, marginBottom: 1 }}><strong>Quests:</strong></Typography>
                {gameState.quests
                  .filter(quest => quest.courseId === course.id)
                  .map(quest => {
                    const IconComponent = iconMap[quest.type.icon] || Star;
                    return (
                      <div key={quest.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <IconComponent size={16} style={{ marginRight: '0.5rem' }} />
                        <Typography variant="body2" style={{ flexGrow: 1 }}>{quest.name}</Typography>
                        <Typography variant="body2" style={{ marginRight: '0.5rem' }}>({quest.reward} EXP)</Typography>
                        <Button 
                          onClick={() => completeQuest(quest.id)} 
                          disabled={quest.completed}
                          size="small"
                          variant="outlined"
                        >
                          {quest.completed ? 'Completed' : 'Complete'}
                        </Button>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default App;