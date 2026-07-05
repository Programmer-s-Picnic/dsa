import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// Question model: one Dart object for one JSON question.
class Question {
  final int id;
  final String question;
  final List<String> options;
  final String answer;
  final int level;
  final int prize;

  Question({
    required this.id,
    required this.question,
    required this.options,
    required this.answer,
    required this.level,
    required this.prize,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'],
      question: json['question'],
      options: List<String>.from(json['options']),
      answer: json['answer'],
      level: json['level'],
      prize: json['prize'],
    );
  }
}

void main() => runApp(const KbcApp());

class KbcApp extends StatelessWidget {
  const KbcApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'KBC Quiz',
      theme: ThemeData.dark(),
      home: const QuizScreen(),
    );
  }
}

class QuizScreen extends StatefulWidget {
  const QuizScreen({super.key});

  @override
  State<QuizScreen> createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  List<Question> questions = [];
  int index = 0;
  String? selected;
  bool locked = false;
  int prizeWon = 0;
  int time = 30;
  String message = '';
  Timer? timer;
  List<String> hiddenOptions = [];
  List<Map<String, dynamic>> poll = [];
  Map<String, bool> lifelines = {'fifty': false, 'skip': false, 'poll': false};

  @override
  void initState() {
    super.initState();
    loadQuestions();
  }

  @override
  void dispose() {
    timer?.cancel();
    super.dispose();
  }

  Future<void> loadQuestions() async {
    final text = await rootBundle.loadString('assets/questions.json');
    final data = jsonDecode(text) as List;
    setState(() {
      questions = data.map((item) => Question.fromJson(item)).toList();
    });
    startTimer();
  }

  Question get q => questions[index];

  void startTimer() {
    timer?.cancel();
    time = 30;
    timer = Timer.periodic(const Duration(seconds: 1), (t) {
      setState(() => time--);
      if (time <= 0) {
        t.cancel();
        setState(() {
          locked = true;
          message = 'Time is up!';
        });
      }
    });
  }

  void lockAnswer() {
    if (selected == null) {
      setState(() => message = 'Please select an answer first.');
      return;
    }
    timer?.cancel();
    setState(() {
      locked = true;
      if (selected == q.answer) {
        prizeWon = q.prize;
        message = 'Correct answer!';
      } else {
        message = 'Wrong answer.';
      }
    });
  }

  void nextQuestion() {
    if (index < questions.length - 1) {
      setState(() {
        index++;
        selected = null;
        locked = false;
        message = '';
        hiddenOptions = [];
        poll = [];
      });
      startTimer();
    } else {
      timer?.cancel();
      setState(() {
        locked = true;
        message = 'Game over! Final prize: ₹$prizeWon';
      });
    }
  }

  void restart() {
    setState(() {
      index = 0;
      selected = null;
      locked = false;
      prizeWon = 0;
      message = '';
      hiddenOptions = [];
      poll = [];
      lifelines = {'fifty': false, 'skip': false, 'poll': false};
    });
    startTimer();
  }

  void useFifty() {
    if (lifelines['fifty']! || locked) return;
    setState(() {
      hiddenOptions = q.options.where((o) => o != q.answer).take(2).toList();
      lifelines['fifty'] = true;
    });
  }

  void skip() {
    if (lifelines['skip']! || locked) return;
    setState(() => lifelines['skip'] = true);
    nextQuestion();
  }

  void audiencePoll() {
    if (lifelines['poll']! || locked) return;
    setState(() {
      poll = q.options.map((o) => {'option': o, 'percent': o == q.answer ? 60 : 10}).toList();
      lifelines['poll'] = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (questions.isEmpty) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(colors: [Color(0xff123a8c), Color(0xff061633)], begin: Alignment.topCenter, end: Alignment.bottomCenter),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(18),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Flutter Project', style: TextStyle(color: Color(0xfff7c948), fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Text('KBC Quiz', style: TextStyle(fontSize: 42, fontWeight: FontWeight.bold)),
                const SizedBox(height: 14),
                Wrap(spacing: 10, runSpacing: 10, children: [
                  Chip(label: Text('Question ${index + 1}')),
                  Chip(label: Text('Time: ${time}s')),
                  Chip(label: Text('Prize: ₹$prizeWon')),
                ]),
                const SizedBox(height: 14),
                Wrap(spacing: 10, runSpacing: 10, children: [
                  ElevatedButton(onPressed: lifelines['fifty']! ? null : useFifty, child: const Text('50:50')),
                  ElevatedButton(onPressed: lifelines['skip']! ? null : skip, child: const Text('Skip')),
                  ElevatedButton(onPressed: lifelines['poll']! ? null : audiencePoll, child: const Text('Audience Poll')),
                ]),
                if (poll.isNotEmpty) Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: poll.map((p) => Text('${p['option']}: ${p['percent']}%')).toList()))),
                const SizedBox(height: 16),
                Card(color: const Color(0xff071f52), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18), side: const BorderSide(color: Color(0xfff7c948), width: 2)), child: Padding(padding: const EdgeInsets.all(18), child: Text(q.question, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)))),
                const SizedBox(height: 12),
                ...q.options.asMap().entries.map((entry) {
                  final i = entry.key;
                  final option = entry.value;
                  if (hiddenOptions.contains(option)) return const SizedBox.shrink();
                  Color color = const Color(0xff102e6b);
                  if (locked && option == q.answer) color = Colors.green;
                  if (locked && selected == option && option != q.answer) color = Colors.red;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: color, padding: const EdgeInsets.all(16), alignment: Alignment.centerLeft),
                      onPressed: locked ? null : () => setState(() => selected = option),
                      child: Text('${'ABCD'[i]}. $option'),
                    ),
                  );
                }),
                Wrap(spacing: 10, runSpacing: 10, children: [
                  ElevatedButton(onPressed: locked ? null : lockAnswer, child: const Text('Lock Answer')),
                  ElevatedButton(onPressed: nextQuestion, child: const Text('Next')),
                  ElevatedButton(onPressed: restart, child: const Text('Restart')),
                ]),
                const SizedBox(height: 10),
                Text(message, style: const TextStyle(color: Color(0xfff7c948), fontWeight: FontWeight.bold, fontSize: 18)),
                const SizedBox(height: 20),
                const Text('Prize Ladder', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                ...questions.asMap().entries.map((e) => Card(color: e.key == index ? const Color(0xfff7c948) : const Color(0xff0b2455), child: ListTile(title: Text('Q${e.key + 1} - ₹${e.value.prize}', style: TextStyle(color: e.key == index ? Colors.black : Colors.white))))),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
