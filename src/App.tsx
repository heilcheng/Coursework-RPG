import React, { useState, useEffect } from 'react';
import { 
  Card, CardContent, CardHeader, CardActions, Typography, 
  LinearProgress, Button, TextField, Select, MenuItem, Grid, 
  IconButton
} from '@mui/material';
import { 
  Book, Star, FileText, PenTool, GraduationCap, Calculator, 
  BarChart, Coffee, Save, Download, Delete
} from 'lucide-react';

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
  relatedSkill: Skill;
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
  };
  courses: Course[];
  quests: Quest[];
}

const QuestTypes: { [key: string]: { name: string; icon: string; baseReward: number } } = {
  ASSIGNMENT: { name: 'Assignment', icon: 'FileText', baseReward: 50 },
  MIDTERM: { name: 'Midterm', icon: 'PenTool', baseReward: 150 },
  FINAL: { name: 'Final Exam', icon: 'GraduationCap', baseReward: 300 }
};

const iconMap: { [key: string]: React.ElementType } = {
  Calculator, BarChart, Coffee, FileText, PenTool, GraduationCap, Star, Book
};

const initialCourses: Course[] = [
  { id: 1, name: "MA2509", relatedSkill: { name: 'Discrete Math', icon: 'Calculator', effect: 'Enhances problem-solving in MA2509', level: 1, exp: 0 } },
  { id: 2, name: "MA2510", relatedSkill: { name: 'Statistics & Probability', icon: 'BarChart', effect: 'Improves data analysis in MA2510', level: 1, exp: 0 } },
  { id: 3, name: "CS2360", relatedSkill: { name: 'Java Programming', icon: 'Coffee', effect: 'Boosts coding efficiency in CS2360', level: 1, exp: 0 } }
];

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
      },
      courses: initialCourses,
      quests: []
    };
  });

  const [newQuest, setNewQuest] = useState({ name: '', courseId: '', type: '' });
  const [newCourse, setNewCourse] = useState({ name: '', skillName: '', skillIcon: '' });

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

  const calculateProgress = (course: Course, quests: Quest[]) => {
    const courseQuests = quests.filter(q => q.courseId === course.id);
    const completedQuests = courseQuests.filter(q => q.completed).length;
    return { current: completedQuests, total: courseQuests.length };
  };

  const toggleQuestCompletion = (questId: string) => {
    setGameState(prev => {
      const quest = prev.quests.find(q => q.id === questId);
      if (!quest) return prev;

      const newQuests = prev.quests.map(q => 
        q.id === questId ? { ...q, completed: !q.completed } : q
      );

      const expGain = quest.completed ? -quest.reward : quest.reward; // Subtract exp if uncompleting
      const newPlayerExp = Math.max(0, prev.player.exp + expGain);
      const newPlayerLevel = Math.floor(newPlayerExp / 100) + 1;

      const course = prev.courses.find(c => c.id === quest.courseId);
      if (course) {
        const skillExpGain = quest.completed ? -Math.round(quest.reward * 0.1) : Math.round(quest.reward * 0.1);
        const newSkillExp = Math.max(0, course.relatedSkill.exp + skillExpGain);
        const newSkillLevel = Math.floor(newSkillExp / 50) + 1;

        const newCourses = prev.courses.map(c => 
          c.id === course.id 
            ? { ...c, relatedSkill: { ...c.relatedSkill, exp: newSkillExp, level: newSkillLevel } }
            : c
        );

        return {
          ...prev,
          player: { ...prev.player, exp: newPlayerExp, level: newPlayerLevel },
          courses: newCourses,
          quests: newQuests
        };
      }

      return {
        ...prev,
        player: { ...prev.player, exp: newPlayerExp, level: newPlayerLevel },
        quests: newQuests
      };
    });
  };

  const deleteQuest = (questId: string) => {
    setGameState(prev => ({
      ...prev,
      quests: prev.quests.filter(q => q.id !== questId)
    }));
  };

  const deleteCourse = (courseId: number) => {
    setGameState(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== courseId),
      quests: prev.quests.filter(q => q.courseId !== courseId)
    }));
  };

  const addNewQuest = () => {
    if (newQuest.name && newQuest.courseId && newQuest.type) {
      const questType = QuestTypes[newQuest.type as keyof typeof QuestTypes];
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

  const addNewCourse = () => {
    if (newCourse.name && newCourse.skillName && newCourse.skillIcon) {
      setGameState(prev => ({
        ...prev,
        courses: [
          ...prev.courses,
          {
            id: Math.max(0, ...prev.courses.map(c => c.id)) + 1, // Ensure unique ID
            name: newCourse.name,
            relatedSkill: {
              name: newCourse.skillName,
              icon: newCourse.skillIcon,
              effect: `Enhances skills in ${newCourse.name}`,
              level: 1,
              exp: 0
            }
          }
        ]
      }));
      setNewCourse({ name: '', skillName: '', skillIcon: '' });
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
        </CardContent>
      </Card>

      <Card sx={{ marginBottom: 2 }}>
        <CardHeader title="Add New Course" />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth
                placeholder="Course Name" 
                value={newCourse.name}
                onChange={(e) => setNewCourse({...newCourse, name: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField 
                fullWidth
                placeholder="Skill Name" 
                value={newCourse.skillName}
                onChange={(e) => setNewCourse({...newCourse, skillName: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <Select
                fullWidth
                value={newCourse.skillIcon}
                onChange={(e) => setNewCourse({...newCourse, skillIcon: e.target.value as string})}
                displayEmpty
              >
                <MenuItem value="" disabled>Skill Icon</MenuItem>
                {Object.keys(iconMap).map(icon => (
                  <MenuItem key={icon} value={icon}>
                    {icon}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button onClick={addNewCourse} variant="contained" fullWidth>Add</Button>
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
                    {QuestTypes[type as keyof typeof QuestTypes].name}
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
        {gameState.courses.map(course => {
          const progress = calculateProgress(course, gameState.quests);
          return (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card>
                <CardHeader
                  title={
                    <Typography variant="h6">
                      <Book style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                      {course.name}
                    </Typography>
                  }
                  action={
                    <IconButton onClick={() => deleteCourse(course.id)}>
                      <Delete />
                    </IconButton>
                  }
                />
                <CardContent>
                  <LinearProgress 
                    variant="determinate" 
                    value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} 
                    sx={{ marginBottom: 1 }} 
                  />
                  <Typography>Progress: {progress.current} / {progress.total}</Typography>
                  
                  <Typography sx={{ marginTop: 2 }}><strong>Skill:</strong></Typography>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                    {iconMap[course.relatedSkill.icon] && React.createElement(iconMap[course.relatedSkill.icon], { size: 16, style: { marginRight: '0.5rem' } })}
                    <Typography>{course.relatedSkill.name} - Level {course.relatedSkill.level}</Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(course.relatedSkill.exp % 50) * 2} 
                      sx={{ width: '100px', marginLeft: '0.5rem' }} 
                    />
                  </div>

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
                            onClick={() => toggleQuestCompletion(quest.id)}
                            size="small"
                            variant={quest.completed ? "contained" : "outlined"}
                          >
                            {quest.completed ? 'Completed' : 'Complete'}
                          </Button>
                          <IconButton onClick={() => deleteQuest(quest.id)} size="small">
                            <Delete />
                          </IconButton>
                        </div>
                      );
                    })}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default App;