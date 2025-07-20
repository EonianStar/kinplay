import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Edge Function 入口
serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // 1. 获取请求体中的 user_id
  let user_id: string | undefined;
  try {
    const body = await req.json();
    user_id = body.user_id;
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: "请求体格式错误，需包含 user_id" }), { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  if (!user_id) {
    return new Response(JSON.stringify({ success: false, error: "缺少 user_id" }), { 
      status: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  }

  // 2. 初始化 Supabase 客户端（使用服务密钥）
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 3. 依次删除业务表数据（先删除子表，再删除主表）
  
  // 删除子表和完成记录表（这些表没有直接的 user_id 字段，需要通过关联删除）
  
  // 删除 daily_tasks（通过 daily_id 关联）
  const { data: dailies, error: dailiesError } = await supabase
    .from('dailies')
    .select('id')
    .eq('user_id', user_id);
  
  if (dailiesError) {
    return new Response(
      JSON.stringify({ success: false, error: `获取日常任务失败: ${dailiesError.message}` }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  if (dailies && dailies.length > 0) {
    const dailyIds = dailies.map(daily => daily.id);
    
    // 删除 daily_tasks
    const { error: dailyTasksError } = await supabase
      .from('daily_tasks')
      .delete()
      .in('daily_id', dailyIds);
    
    if (dailyTasksError) {
      return new Response(
        JSON.stringify({ success: false, error: `删除日常任务子任务失败: ${dailyTasksError.message}` }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // 删除 daily_completions
    const { error: dailyCompletionsError } = await supabase
      .from('daily_completions')
      .delete()
      .in('daily_id', dailyIds);
    
    if (dailyCompletionsError) {
      return new Response(
        JSON.stringify({ success: false, error: `删除日常任务完成记录失败: ${dailyCompletionsError.message}` }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
  
  // 删除 todo_tasks 和 todo_completions（通过 todo_id 关联）
  const { data: todos, error: todosError } = await supabase
    .from('todos')
    .select('id')
    .eq('user_id', user_id);
  
  if (todosError) {
    return new Response(
      JSON.stringify({ success: false, error: `获取待办事项失败: ${todosError.message}` }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  if (todos && todos.length > 0) {
    const todoIds = todos.map(todo => todo.id);
    
    // 删除 todo_tasks
    const { error: todoTasksError } = await supabase
      .from('todo_tasks')
      .delete()
      .in('todo_id', todoIds);
    
    if (todoTasksError) {
      return new Response(
        JSON.stringify({ success: false, error: `删除待办事项子任务失败: ${todoTasksError.message}` }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // 删除 todo_completions
    const { error: todoCompletionsError } = await supabase
      .from('todo_completions')
      .delete()
      .in('todo_id', todoIds);
    
    if (todoCompletionsError) {
      return new Response(
        JSON.stringify({ success: false, error: `删除待办事项完成记录失败: ${todoCompletionsError.message}` }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
  
  // 删除 habit_completions（通过 habit_id 关联）
  const { data: habits, error: habitsError } = await supabase
    .from('habits')
    .select('id')
    .eq('user_id', user_id);
  
  if (habitsError) {
    return new Response(
      JSON.stringify({ success: false, error: `获取习惯失败: ${habitsError.message}` }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
  
  if (habits && habits.length > 0) {
    const habitIds = habits.map(habit => habit.id);
    
    const { error: habitCompletionsError } = await supabase
      .from('habit_completions')
      .delete()
      .in('habit_id', habitIds);
    
    if (habitCompletionsError) {
      return new Response(
        JSON.stringify({ success: false, error: `删除习惯完成记录失败: ${habitCompletionsError.message}` }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }
  
  // 删除主表（这些表有 user_id 字段）
  const mainTables = [
    "dailies",
    "habits",
    "todos",
    "rewards",
    "user_stats"
  ];

  for (const table of mainTables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("user_id", user_id);
    if (error) {
      return new Response(
        JSON.stringify({ success: false, error: error.message, table }),
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json',
          },
        }
      );
    }
  }

  // 4. 删除用户认证信息
  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user_id);
  if (deleteUserError) {
    return new Response(
      JSON.stringify({ success: false, error: `删除用户认证信息失败: ${deleteUserError.message}` }),
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // 5. 记录删除的邮箱，用于后续登录提示
  // 注意：这里我们只是记录日志，实际应用中可能需要更复杂的处理
  console.log(`用户 ${user_id} 的账号已被删除`);

  return new Response(JSON.stringify({ success: true }), { 
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  });
}); 