import indexTpl from '../views/index.art'
import usersTpl from '../views/users.art'
import usersListTpl from '../views/users-list.art'

import pagination from '../components/pagination'

import router from '../routes'
const htmlIndex = indexTpl({})
const pageSize = 3;
let curPage = 1;
let dataList = [];


// 提交新增用户
const _signup = () => {
    // 提交表单
    const data = $('#users-form').serialize()
    $.ajax({
        url: '/api/users/',
        type: 'post',
        data,
        success(res) {
            // 添加数据后渲染
            _loadData()
        }
    })
    // 关闭模态框
    $('#users-close').click();
}

// 请求数据
const _loadData = () => {
    $.ajax({
        url: '/api/users/',
        type: 'get',
        // async:false,
        success(result) {
            dataList = result.data;
            // 分页
            pagination(result.data,pageSize,curPage)
            _list(curPage);
        }
    })
}

// 获取列表数据并渲染
const _list = (pageNo) => {
    let start = (pageNo - 1) * pageSize
    $("#users-list").html(usersListTpl({
        data: dataList.slice(start, start + pageSize)
    }))
}

// 所有的事件方法
const _methods = () => {
    // 删除事件绑定
    $('#users-list').on('click', '.remove', function () {
        $.ajax({
            url: '/api/users/',
            type: 'delete',
            data: {
                id: $(this).data('id')
            },
            success() {
                console.log('01');
                // 初次渲染list
                _loadData()
                if (Math.ceil(dataList.length / pageSize) === curPage && dataList.length % pageSize === 1 && curPage > 0) {
                    curPage--
                }
                // 分页
                pagination(dataList,pageSize,curPage)
            }
        })
    })
    
    // 点击保存，提交表单
    $('#users-save').on('click', _signup)
}

// 发布订阅模式===注册
const _subscribe = ()=>{
    $.on('changeCurPage',()=>{
        console.log(0);
    })
}


// 初始化数据
const index = router => {
    const loadIndex = (res) => {
        // 渲染首页
        res.render(htmlIndex)
        // 填充用户列表
        $('#content').html(usersTpl());
        // 初次渲染list
        _loadData()
        
        // 页面事件绑定
        _methods();
        // 退出登录
        $("#users-signout").on('click', (e) => {
            e.preventDefault();
            $.ajax({
                url: '/api/users/signout',
                success(result) {
                    if (result.ret) {
                        location.reload()
                    }
                }

            })

        })
        
        // 分页
        pagination(dataList,pageSize,curPage)
    }
    return (req, res, next) => {
        $.ajax({
            url: '/api/users/isAuth',
            dataType: 'json',
            success(result) {
                if (result.ret) {
                    loadIndex(res)
                } else {
                    router.go('/signin')
                }
            }
        })
    }
}
export default index